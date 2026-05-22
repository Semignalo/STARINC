<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'price', 'original_price', 'discount_label',
        'category', 'description', 'ingredients', 'packaging',
        'main_image', 'main_image_driver', 'main_image_public_id',
        'feature_image', 'feature_image_driver', 'feature_image_public_id',
        'feature_title', 'feature_text',
        'video_url', 'is_promo', 'sort_order', 'stock', 'weight', 'pdf_path',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'original_price' => 'decimal:2',
        'is_promo'       => 'boolean',
        'stock'          => 'integer',
    ];

    protected $appends = ['main_image_url', 'feature_image_url', 'is_out_of_stock', 'pdf_url'];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ProductMedia::class)->orderBy('sort_order');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(\App\Models\OrderItem::class);
    }

    /**
     * Full public URL for the main image.
     * Returns null if no main_image is set.
     */
    public function getMainImageUrlAttribute(): ?string
    {
        if (!$this->main_image) return null;
        // Cloudinary: main_image sudah berupa secure_url absolut.
        if ($this->main_image_driver === 'cloudinary') {
            return $this->main_image;
        }
        return Storage::disk('public')->url($this->main_image);
    }

    public function getFeatureImageUrlAttribute(): ?string
    {
        if (!$this->feature_image) return null;
        if ($this->feature_image_driver === 'cloudinary') {
            return $this->feature_image;
        }
        return Storage::disk('public')->url($this->feature_image);
    }

    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->pdf_path) return null;
        return Storage::disk('public')->url($this->pdf_path);
    }

    /**
     * Whether the product is completely out of stock.
     *
     * Logic:
     * - No variants: use product-level stock (null = unlimited → false).
     * - Has variants: true only if EVERY variant is explicitly out of stock (stock = 0).
     *   A variant with null stock falls back to the product-level stock.
     */
    public function getIsOutOfStockAttribute(): bool
    {
        // Product-level stock: null means unlimited
        $productStock = $this->stock;

        if ($this->relationLoaded('variants') && $this->variants->isNotEmpty()) {
            foreach ($this->variants as $variant) {
                // Variant with null stock inherits product-level stock
                $effectiveStock = $variant->stock ?? $productStock;
                // If any variant is available (null = unlimited, or > 0), not fully out
                if ($effectiveStock === null || $effectiveStock > 0) {
                    return false;
                }
            }
            return true;
        }

        // No variants: only out of stock if explicitly set to 0
        return $productStock !== null && $productStock <= 0;
    }
}
