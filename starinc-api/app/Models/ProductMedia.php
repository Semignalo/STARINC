<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductMedia extends Model
{
    protected $fillable = ['product_id', 'file_path', 'driver', 'public_id', 'type', 'sort_order'];

    protected $appends = ['url'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Absolute public URL to the media file.
     * Accessible as $media->url or in JSON as "url".
     */
    public function getUrlAttribute(): string
    {
        // Cloudinary: file_path sudah berupa secure_url absolut.
        if ($this->driver === 'cloudinary') {
            return $this->file_path;
        }
        return Storage::disk('public')->url($this->file_path);
    }
}
