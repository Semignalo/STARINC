<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use App\Services\Media\MediaStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function __construct(private MediaStorageService $media) {}

    /**
     * List all products (public).
     */
    public function index(Request $request)
    {
        // Cache hanya untuk request tanpa filter (paling sering di-hit dari homepage/katalog)
        $cacheable = !$request->hasAny(['category', 'promo', 'search']);
        $version   = (int) Cache::get('products:version', 1);
        $cacheKey  = "products:list:v{$version}:page=" . $request->get('page', 1) . ':per=' . $request->get('per_page', 50);

        $fetch = function () use ($request) {
            $query = Product::with(['variants', 'media']);

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            if ($request->has('promo')) {
                $query->where('is_promo', true);
            }
            if ($request->has('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            // toArray agar bisa di-serialize ke cache database driver (Paginator object tidak safely cacheable)
            return $query->orderBy('sort_order')->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 50))->toArray();
        };

        $products = $cacheable
            ? Cache::remember($cacheKey, now()->addMinutes(5), $fetch)
            : $fetch();

        return response()->json($products);
    }

    /**
     * Get a single product (public).
     */
    public function show(int $id)
    {
        $version = (int) Cache::get('products:version', 1);
        $product = Cache::remember(
            "product:v{$version}:{$id}",
            now()->addMinutes(5),
            fn () => Product::with(['variants', 'media'])->findOrFail($id)->toArray(),
        );
        return response()->json($product);
    }

    /**
     * Bump version key — efek: semua cache key dengan version lama jadi tidak ter-hit.
     * Dipanggil setelah create/update/delete produk. Tidak butuh tag support.
     */
    private function bustProductCache(): void
    {
        Cache::increment('products:version');
    }

    /**
     * Create a product (admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'price'          => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'discount_label' => 'nullable|string|max:50',
            'category'       => 'required|string|max:100',
            'description'    => 'nullable|string',
            'ingredients'    => 'nullable|string',
            'packaging'      => 'nullable|string',
            'feature_image'  => 'nullable|string',
            'feature_title'  => 'nullable|string|max:255',
            'feature_text'   => 'nullable|string',
            'video_url'      => 'nullable|url|max:500',
            'is_promo'       => 'boolean',
            'sort_order'     => 'integer',
            'stock'          => 'nullable|integer|min:0',
            'variants'         => 'nullable|array',
            'variants.*.name'  => 'required_with:variants|string|max:100',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
        ]);

        $product = Product::create($validated);

        // Create variants
        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $variant) {
                $product->variants()->create($variant);
            }
        }

        $this->bustProductCache();

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'product' => $product->load(['variants', 'media']),
        ], 201);
    }

    /**
     * Update a product (admin).
     */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'title'          => 'sometimes|string|max:255',
            'price'          => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'discount_label' => 'nullable|string|max:50',
            'category'       => 'sometimes|string|max:100',
            'description'    => 'nullable|string',
            'ingredients'    => 'nullable|string',
            'packaging'      => 'nullable|string',
            'feature_image'  => 'nullable|string',
            'feature_title'  => 'nullable|string|max:255',
            'feature_text'   => 'nullable|string',
            'video_url'      => 'nullable|url|max:500',
            'is_promo'       => 'boolean',
            'sort_order'     => 'integer',
            'stock'          => 'nullable|integer|min:0',
            'main_image'     => 'nullable|string',
            'variants'         => 'nullable|array',
            'variants.*.name'  => 'required_with:variants|string|max:100',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
        ]);

        $product->update($validated);

        // Sync variants if provided
        if (array_key_exists('variants', $validated)) {
            $product->variants()->delete();
            foreach ($validated['variants'] ?? [] as $variant) {
                $product->variants()->create($variant);
            }
        }

        $this->bustProductCache();

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'product' => $product->load(['variants', 'media']),
        ]);
    }

    /**
     * Delete a product (admin).
     * Uses soft delete so order history referencing this product is preserved.
     * Media files and records are only hard-deleted if the product has no orders.
     */
    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);

        $hasOrders = $product->orderItems()->exists();

        if (!$hasOrders) {
            foreach ($product->media as $media) {
                $this->media->delete($media->driver, $media->driver === 'cloudinary' ? $media->public_id : $media->file_path);
            }
            $product->media()->delete();
            $product->variants()->delete();
        }

        $product->delete();
        $this->bustProductCache();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    /**
     * Upload media for a product (admin).
     */
    public function uploadMedia(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'files'   => 'required|array',
            'files.*' => 'file|mimes:jpg,jpeg,png,webp,gif,mp4,webm|max:20480', // 20MB max
            'driver'  => 'nullable|in:local,cloudinary',
        ]);

        $driver   = $request->input('driver');
        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $result = $this->media->upload($file, 'products', $product->id, $driver);
            $type   = str_starts_with($file->getMimeType() ?? '', 'video/') ? 'video' : 'image';

            $media = $product->media()->create([
                'file_path'  => $result->url,        // simpan URL siap pakai (untuk cloudinary) atau path (untuk local kalau driver=local kita override di bawah)
                'driver'     => $result->driver,
                'public_id'  => $result->publicId,
                'type'       => $type,
                'sort_order' => $product->media()->count(),
            ]);

            // Untuk local, simpan path relatif (bukan URL absolut) agar accessor bisa generate URL via Storage
            if ($result->driver === 'local') {
                $media->update(['file_path' => $result->path]);
            }

            $uploaded[] = $media->fresh();

            // Set sebagai main image bila produk belum punya
            if (!$product->main_image && $type === 'image') {
                $product->update([
                    'main_image'           => $result->driver === 'local' ? $result->path : $result->url,
                    'main_image_driver'    => $result->driver,
                    'main_image_public_id' => $result->publicId,
                ]);
            }
        }

        $this->bustProductCache();

        return response()->json([
            'message' => count($uploaded) . ' file berhasil diunggah.',
            'media'   => $uploaded,
        ]);
    }

    /** Reorder media items for a product (admin). */
    public function reorderMedia(Request $request, int $id)
    {
        $validated = $request->validate([
            'order'              => 'required|array',
            'order.*.id'         => 'required|integer',
            'order.*.sort_order' => 'required|integer',
        ]);

        $product = Product::findOrFail($id);

        foreach ($validated['order'] as $item) {
            $product->media()->where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        $this->bustProductCache();
        return response()->json(['message' => 'Media reordered.']);
    }

    /** Delete a single media item from a product (admin). */
    public function deleteMedia(int $productId, int $mediaId)
    {
        $product = Product::findOrFail($productId);
        $media   = $product->media()->findOrFail($mediaId);

        $this->media->delete($media->driver, $media->driver === 'cloudinary' ? $media->public_id : $media->file_path);

        // Jika media ini juga main_image, fallback ke media berikutnya
        $wasMain = $product->main_image === $media->file_path
            || ($media->driver === 'cloudinary' && $product->main_image_public_id === $media->public_id);

        if ($wasMain) {
            $next = $product->media()->where('id', '!=', $mediaId)->where('type', 'image')->first();
            $product->update([
                'main_image'           => $next ? ($next->driver === 'local' ? $next->file_path : $next->file_path) : null,
                'main_image_driver'    => $next?->driver ?? 'local',
                'main_image_public_id' => $next?->public_id,
            ]);
        }

        $media->delete();
        $this->bustProductCache();

        return response()->json(['message' => 'Media berhasil dihapus.']);
    }

    /** Stream PDF brochure with CORS headers (public). */
    public function streamPdf(int $id)
    {
        $product = Product::findOrFail($id);

        if (!$product->pdf_path || !Storage::disk('public')->exists($product->pdf_path)) {
            return response()->json(['message' => 'No PDF found.'], 404);
        }

        $path = Storage::disk('public')->path($product->pdf_path);

        return response()->file($path, [
            'Content-Type'                => 'application/pdf',
            'Content-Disposition'         => 'inline',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    /** Upload PDF brochure for a product (admin). */
    public function uploadPdf(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($product->pdf_path) {
            Storage::disk('public')->delete($product->pdf_path);
        }

        $path = $request->file('pdf')->store('products/pdfs', 'public');
        $product->update(['pdf_path' => $path]);

        return response()->json([
            'message' => 'PDF berhasil diunggah.',
            'pdf_url' => Storage::disk('public')->url($path),
        ]);
    }

    /** Remove PDF brochure from a product (admin). */
    public function removePdf(int $id)
    {
        $product = Product::findOrFail($id);

        if ($product->pdf_path) {
            Storage::disk('public')->delete($product->pdf_path);
            $product->update(['pdf_path' => null]);
        }

        return response()->json(['message' => 'PDF berhasil dihapus.']);
    }
}
