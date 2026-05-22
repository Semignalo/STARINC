<?php

namespace App\Console\Commands;

use App\Models\PaymentProof;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Services\Media\MediaStorageService;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Migrasi semua media yang masih driver=local ke Cloudinary.
 *
 * Cara pakai:
 *   php artisan media:migrate-cloud                           # dry-run preview
 *   php artisan media:migrate-cloud --execute                 # eksekusi (tetap simpan file lokal)
 *   php artisan media:migrate-cloud --execute --delete-local  # eksekusi + hapus file lokal setelah sukses
 *   php artisan media:migrate-cloud --execute --only=products # hanya migrasi tabel products (main_image)
 *
 * Yang dimigrasi:
 *   - products.main_image (kalau driver=local)
 *   - product_media.file_path (semua row driver=local)
 *   - payment_proofs DIKECUALIKAN by default (sensitif, simpan di private storage)
 */
class MigrateMediaToCloud extends Command
{
    protected $signature = 'media:migrate-cloud
                            {--execute : Eksekusi migrasi (default: dry-run)}
                            {--delete-local : Hapus file lokal setelah upload Cloudinary sukses}
                            {--only=all : products|media|all (default: all)}
                            {--resize : Resize image > 9MB ke max 2000px width quality 85 sebelum upload (Cloudinary free tier max 10MB)}';

    protected $description = 'Migrasi gambar dari local storage ke Cloudinary';

    private bool $resize = false;
    private array $tempFiles = [];

    public function handle(MediaStorageService $svc): int
    {
        // GD resize memerlukan banyak memory untuk gambar besar.
        // Bumped ke 512M (cukup untuk 20-30 MP image).
        @ini_set('memory_limit', '512M');

        $execute     = $this->option('execute');
        $deleteLocal = $this->option('delete-local');
        $only        = $this->option('only');
        $this->resize = (bool) $this->option('resize');

        if (!$execute) {
            $this->warn('=== DRY RUN MODE === (tambah --execute untuk benar-benar migrasi)');
            $this->newLine();
        } else {
            $this->info('=== EXECUTING ===');
            if ($deleteLocal) {
                $this->warn('File lokal akan DIHAPUS setelah upload sukses.');
            }
            if (!$this->confirm('Lanjutkan?', true)) {
                $this->info('Dibatalkan.');
                return self::SUCCESS;
            }
        }

        $stats = ['migrated' => 0, 'skipped' => 0, 'failed' => 0];

        if (in_array($only, ['all', 'media'])) {
            $this->migrateProductMedia($svc, $execute, $deleteLocal, $stats);
        }
        if (in_array($only, ['all', 'products'])) {
            $this->migrateProductMainImages($svc, $execute, $deleteLocal, $stats);
        }

        $this->newLine();
        $this->table(['Status', 'Count'], [
            ['Migrated', $stats['migrated']],
            ['Skipped',  $stats['skipped']],
            ['Failed',   $stats['failed']],
        ]);

        // Bust product cache
        if ($execute && $stats['migrated'] > 0) {
            \Illuminate\Support\Facades\Cache::increment('products:version');
            $this->info('Cache produk di-flush.');
        }

        // Cleanup temp resized files
        foreach ($this->tempFiles as $tmp) {
            @unlink($tmp);
        }

        return $stats['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Bila --resize aktif dan file gambar > 9MB, resize ke max 2000px wide quality 85,
     * simpan di temp file, return path temp. Kalau tidak, return path asli.
     */
    private function prepareForUpload(string $absPath): string
    {
        if (!$this->resize) return $absPath;

        $size = @filesize($absPath);
        if ($size === false || $size <= 9 * 1024 * 1024) return $absPath;

        $mime = mime_content_type($absPath) ?: '';
        if (!str_starts_with($mime, 'image/')) return $absPath; // hanya gambar

        $info = @getimagesize($absPath);
        if (!$info) return $absPath;
        [$w, $h] = $info;

        $maxW = 2000;
        if ($w <= $maxW) {
            // Sudah cukup kecil dimensi-nya tapi besar bytenya — turunkan quality saja
            $newW = $w;
            $newH = $h;
        } else {
            $newW = $maxW;
            $newH = (int) round($h * ($maxW / $w));
        }

        $src = match (true) {
            str_contains($mime, 'jpeg') || str_contains($mime, 'jpg') => @imagecreatefromjpeg($absPath),
            str_contains($mime, 'png')  => @imagecreatefrompng($absPath),
            str_contains($mime, 'webp') => @imagecreatefromwebp($absPath),
            default => null,
        };
        if (!$src) return $absPath;

        $dst = imagecreatetruecolor($newW, $newH);
        if (str_contains($mime, 'png')) {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
        }
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $w, $h);

        $tmp = tempnam(sys_get_temp_dir(), 'mig_') . '.jpg';
        // Konversi semua ke JPEG quality 85 — paling ringan & universal
        imagejpeg($dst, $tmp, 85);
        imagedestroy($src);
        imagedestroy($dst);

        $this->tempFiles[] = $tmp;
        return $tmp;
    }

    /**
     * Migrasi product_media rows driver=local.
     */
    private function migrateProductMedia(MediaStorageService $svc, bool $execute, bool $deleteLocal, array &$stats): void
    {
        $items = ProductMedia::where('driver', 'local')->get();
        $this->info("Found {$items->count()} product_media rows dengan driver=local");

        $bar = $this->output->createProgressBar($items->count());
        $bar->start();

        foreach ($items as $media) {
            if (!Storage::disk('public')->exists($media->file_path)) {
                $this->newLine();
                $this->warn("  [skip] media#{$media->id} file tidak ada: {$media->file_path}");
                $stats['skipped']++;
                $bar->advance();
                continue;
            }

            if (!$execute) {
                $stats['migrated']++;
                $bar->advance();
                continue;
            }

            try {
                $absPath = Storage::disk('public')->path($media->file_path);
                $uploadPath = $this->prepareForUpload($absPath);
                $file = new UploadedFile(
                    $uploadPath,
                    basename($media->file_path),
                    mime_content_type($uploadPath) ?: 'application/octet-stream',
                    null,
                    true
                );
                $result = $svc->upload($file, 'products', $media->product_id, 'cloudinary');

                $oldLocalPath = $media->file_path;
                $media->update([
                    'file_path' => $result->url,
                    'driver'    => 'cloudinary',
                    'public_id' => $result->publicId,
                ]);

                // Sinkronkan products.main_image jika row ini adalah main image
                $product = Product::find($media->product_id);
                if ($product && $product->main_image === $oldLocalPath) {
                    $product->update([
                        'main_image'           => $result->url,
                        'main_image_driver'    => 'cloudinary',
                        'main_image_public_id' => $result->publicId,
                    ]);
                }

                if ($deleteLocal) {
                    Storage::disk('public')->delete($oldLocalPath);
                }

                $stats['migrated']++;
            } catch (\Throwable $e) {
                $this->newLine();
                $this->error("  [fail] media#{$media->id}: " . $e->getMessage());
                $stats['failed']++;
            }
            $bar->advance();
        }
        $bar->finish();
        $this->newLine();
    }

    /**
     * Migrasi products.main_image yang driver=local DAN tidak punya row di product_media
     * (langka, tapi mungkin ada produk yang main_image diset manual via update tanpa lewat media uploader).
     */
    private function migrateProductMainImages(MediaStorageService $svc, bool $execute, bool $deleteLocal, array &$stats): void
    {
        $items = Product::where('main_image_driver', 'local')
            ->whereNotNull('main_image')
            ->get();

        // Filter yang main_image-nya tidak terlihat seperti URL (yaitu masih path lokal),
        // dan belum tersinkron oleh migrateProductMedia.
        $items = $items->filter(function ($p) {
            return !str_starts_with($p->main_image, 'http');
        });

        $this->info("Found {$items->count()} products dengan main_image local-only (orphan, tidak ada di product_media)");

        foreach ($items as $product) {
            if (!Storage::disk('public')->exists($product->main_image)) {
                $this->warn("  [skip] product#{$product->id} main_image tidak ada: {$product->main_image}");
                $stats['skipped']++;
                continue;
            }

            if (!$execute) {
                $stats['migrated']++;
                continue;
            }

            try {
                $absPath = Storage::disk('public')->path($product->main_image);
                $uploadPath = $this->prepareForUpload($absPath);
                $file = new UploadedFile(
                    $uploadPath,
                    basename($product->main_image),
                    mime_content_type($uploadPath) ?: 'application/octet-stream',
                    null,
                    true
                );
                $result = $svc->upload($file, 'products', $product->id, 'cloudinary');

                $oldLocalPath = $product->main_image;
                $product->update([
                    'main_image'           => $result->url,
                    'main_image_driver'    => 'cloudinary',
                    'main_image_public_id' => $result->publicId,
                ]);

                if ($deleteLocal) {
                    Storage::disk('public')->delete($oldLocalPath);
                }

                $stats['migrated']++;
            } catch (\Throwable $e) {
                $this->error("  [fail] product#{$product->id}: " . $e->getMessage());
                $stats['failed']++;
            }
        }
    }
}
