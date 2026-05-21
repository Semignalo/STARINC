<?php

namespace App\Services\Media;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;

/**
 * MediaStorageService — abstraksi upload media dengan dual-driver.
 *
 * Driver yang didukung:
 * - 'local'      : simpan di disk Laravel 'public' (storage/app/public)
 * - 'cloudinary' : upload ke Cloudinary CDN dengan folder starinc/{type}/{id}
 *
 * Default driver ditentukan oleh config('media.default_driver').
 * Driver bisa di-override per upload via parameter $driver.
 */
class MediaStorageService
{
    private ?Cloudinary $cloudinary = null;

    /**
     * Upload sebuah file ke storage yang dipilih.
     *
     * @param  UploadedFile  $file       File yang diupload
     * @param  string        $type       Tipe asset (products, payment_proofs, dll) — lihat config('media.folders')
     * @param  string|int    $ownerId    ID owner (product_id, order_id, dll) untuk subfolder
     * @param  string|null   $driver     Override driver: 'local' | 'cloudinary' | null (pakai default)
     */
    public function upload(
        UploadedFile $file,
        string $type,
        string|int $ownerId,
        ?string $driver = null
    ): MediaUploadResult {
        $driver = $driver ?: config('media.default_driver', 'local');

        return match ($driver) {
            'cloudinary' => $this->uploadToCloudinary($file, $type, $ownerId),
            'local'      => $this->uploadToLocal($file, $type, $ownerId),
            default      => throw new InvalidArgumentException("Driver media tidak dikenal: {$driver}"),
        };
    }

    /**
     * Hapus file berdasarkan driver & path/public_id.
     */
    public function delete(string $driver, string $pathOrPublicId): bool
    {
        return match ($driver) {
            'cloudinary' => $this->deleteFromCloudinary($pathOrPublicId),
            'local'      => Storage::disk('public')->delete($pathOrPublicId),
            default      => false,
        };
    }

    // ── Cloudinary ─────────────────────────────────────────

    private function uploadToCloudinary(UploadedFile $file, string $type, string|int $ownerId): MediaUploadResult
    {
        $folder = $this->folderFor($type) . '/' . $ownerId;

        $isVideo = str_starts_with($file->getMimeType() ?? '', 'video/');

        $result = $this->cloudinary()->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder'        => $folder,
                'resource_type' => $isVideo ? 'video' : 'image',
                'overwrite'     => false,
                'unique_filename' => true,
            ]
        );

        $data = $result->getArrayCopy();

        return new MediaUploadResult(
            driver:   'cloudinary',
            path:     $data['public_id'],
            url:      $data['secure_url'],
            publicId: $data['public_id'],
            width:    $data['width']    ?? null,
            height:   $data['height']   ?? null,
            bytes:    $data['bytes']    ?? null,
            format:   $data['format']   ?? null,
        );
    }

    private function deleteFromCloudinary(string $publicId): bool
    {
        try {
            $this->cloudinary()->uploadApi()->destroy($publicId);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function cloudinary(): Cloudinary
    {
        if ($this->cloudinary) {
            return $this->cloudinary;
        }

        $config = config('media.drivers.cloudinary');

        if (empty($config['cloud_name']) || empty($config['api_key']) || empty($config['api_secret'])) {
            throw new RuntimeException(
                'Cloudinary credentials belum diset di .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)'
            );
        }

        return $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $config['cloud_name'],
                'api_key'    => $config['api_key'],
                'api_secret' => $config['api_secret'],
            ],
            'url' => ['secure' => true],
        ]);
    }

    // ── Local ──────────────────────────────────────────────

    private function uploadToLocal(UploadedFile $file, string $type, string|int $ownerId): MediaUploadResult
    {
        $folder = $this->folderFor($type) . '/' . $ownerId;
        $path   = $file->store($folder, 'public');

        [$width, $height] = $this->dimensionsFor($file);

        return new MediaUploadResult(
            driver: 'local',
            path:   $path,
            url:    Storage::disk('public')->url($path),
            width:  $width,
            height: $height,
            bytes:  $file->getSize() ?: null,
            format: $file->getClientOriginalExtension() ?: null,
        );
    }

    private function dimensionsFor(UploadedFile $file): array
    {
        if (! str_starts_with($file->getMimeType() ?? '', 'image/')) {
            return [null, null];
        }
        $info = @getimagesize($file->getRealPath());
        return $info ? [$info[0], $info[1]] : [null, null];
    }

    // ── Helpers ────────────────────────────────────────────

    private function folderFor(string $type): string
    {
        $folders = config('media.folders', []);
        if (! isset($folders[$type])) {
            throw new InvalidArgumentException("Tipe media '{$type}' belum terdaftar di config('media.folders')");
        }
        return $folders[$type];
    }
}
