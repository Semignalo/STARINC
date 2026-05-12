<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    /** TTL cache dalam detik (1 jam). */
    private const CACHE_TTL = 3600;

    /**
     * Get a setting value by key with optional default.
     * Setiap pemanggilan di-cache 1 jam agar tidak membebani DB.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $cacheKey = "setting_{$key}";

        $value = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($key) {
            $setting = static::where('key', $key)->first();

            // Simpan sentinel '__NULL__' agar default null tetap di-cache
            return $setting ? $setting->value : '__NULL__';
        });

        if ($value === '__NULL__') {
            return $default;
        }

        return $value;
    }

    /**
     * Get cached setting value — alias eksplisit untuk keterbacaan kode.
     */
    public static function getCached(string $key, mixed $default = null): mixed
    {
        return static::getValue($key, $default);
    }

    /**
     * Set a setting value (create or update) dan invalidasi cache.
     */
    public static function setValue(string $key, mixed $value, string $group = 'general'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );

        // Invalidasi cache agar nilai terbaru langsung terbaca
        Cache::forget("setting_{$key}");
    }

    /**
     * Invalidasi semua cache settings (berguna saat bulk update dari admin panel).
     */
    public static function flushCache(): void
    {
        $keys = static::pluck('key');
        foreach ($keys as $key) {
            Cache::forget("setting_{$key}");
        }
    }
}
