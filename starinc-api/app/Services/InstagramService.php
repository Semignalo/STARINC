<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * InstagramService — fetch post terbaru dari Instagram Graph API.
 *
 * Endpoint yang dipakai:
 *   GET /{ig-business-id}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp&limit=N
 *
 * Token long-lived (60 hari). Refresh manual saat habis, atau via cron.
 *
 * Hasil dicache 30 menit (config('instagram.cache_ttl_minutes')) untuk hindari
 * rate-limit (~200 call/jam/user pada free tier Meta Graph API).
 */
class InstagramService
{
    private string $apiBase;

    public function __construct()
    {
        $this->apiBase = 'https://graph.facebook.com/' . config('instagram.api_version', 'v21.0');
    }

    /**
     * Cek apakah service ter-configure dengan token + business id.
     */
    public function isConfigured(): bool
    {
        return !empty(config('instagram.access_token'))
            && !empty(config('instagram.business_id'));
    }

    /**
     * Ambil post terbaru. Return array of:
     *   { id, type, image, video, permalink, caption, timestamp }
     */
    public function latestPosts(?int $limit = null): array
    {
        if (!$this->isConfigured()) {
            return [];
        }

        $limit = $limit ?? (int) config('instagram.feed_limit', 5);
        $ttl   = (int) config('instagram.cache_ttl_minutes', 30);

        $cacheKey = "instagram:posts:limit={$limit}";

        return Cache::remember($cacheKey, now()->addMinutes($ttl), function () use ($limit) {
            return $this->fetchFromApi($limit);
        });
    }

    /**
     * Force refresh — bust cache lalu fetch ulang. Dipakai untuk admin tombol
     * "Refresh now" atau scheduled refresh.
     */
    public function forceRefresh(?int $limit = null): array
    {
        $limit = $limit ?? (int) config('instagram.feed_limit', 5);
        Cache::forget("instagram:posts:limit={$limit}");
        return $this->latestPosts($limit);
    }

    /**
     * Validate token (call /me untuk lihat error). Return:
     *   { ok: bool, error: ?string, expires_at: ?string }
     */
    public function validateToken(): array
    {
        $token = config('instagram.access_token');
        if (empty($token)) {
            return ['ok' => false, 'error' => 'INSTAGRAM_ACCESS_TOKEN belum diisi di .env'];
        }
        if (empty(config('instagram.business_id'))) {
            return ['ok' => false, 'error' => 'INSTAGRAM_BUSINESS_ID belum diisi di .env'];
        }

        try {
            $resp = Http::timeout(10)->get("{$this->apiBase}/debug_token", [
                'input_token'  => $token,
                'access_token' => $token,
            ]);

            if (!$resp->successful()) {
                return ['ok' => false, 'error' => 'API call gagal: HTTP ' . $resp->status()];
            }

            $data = $resp->json('data') ?? [];
            if (!($data['is_valid'] ?? false)) {
                return ['ok' => false, 'error' => $data['error']['message'] ?? 'Token tidak valid'];
            }

            $expiresAt = isset($data['expires_at']) && $data['expires_at'] > 0
                ? date('c', $data['expires_at'])
                : null;

            return [
                'ok' => true,
                'expires_at' => $expiresAt,
                'scopes' => $data['scopes'] ?? [],
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // ─────────────────────────────────────────────────────────

    private function fetchFromApi(int $limit): array
    {
        $businessId  = config('instagram.business_id');
        $accessToken = config('instagram.access_token');

        try {
            $resp = Http::timeout(10)->get("{$this->apiBase}/{$businessId}/media", [
                'fields'       => 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp',
                'limit'        => $limit,
                'access_token' => $accessToken,
            ]);

            if (!$resp->successful()) {
                Log::warning('Instagram API non-200', [
                    'status' => $resp->status(),
                    'body'   => $resp->json(),
                ]);
                return [];
            }

            $items = $resp->json('data') ?? [];

            return array_map(function ($item) {
                return [
                    'id'        => $item['id'] ?? null,
                    'type'      => strtolower($item['media_type'] ?? 'image'),
                    // Untuk video, media_url = video file. Thumbnail bisa pakai thumbnail_url.
                    'image'     => $item['thumbnail_url'] ?? $item['media_url'] ?? null,
                    'video'     => ($item['media_type'] ?? '') === 'VIDEO' ? ($item['media_url'] ?? null) : null,
                    'permalink' => $item['permalink'] ?? null,
                    'caption'   => $item['caption'] ?? '',
                    'timestamp' => $item['timestamp'] ?? null,
                ];
            }, $items);
        } catch (\Throwable $e) {
            Log::error('Instagram fetch error', ['msg' => $e->getMessage()]);
            return [];
        }
    }
}
