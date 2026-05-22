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
    // Instagram Login API (token IGAA...) endpoint base.
    // Bila Anda pakai Facebook Login (token EAAh...), ganti ke graph.facebook.com.
    private string $apiBase;

    public function __construct()
    {
        $version = config('instagram.api_version', 'v21.0');
        $this->apiBase = "https://graph.instagram.com/{$version}";
    }

    /**
     * Cek apakah service ter-configure dengan token.
     * Business ID opsional (hanya dipakai untuk Facebook Login API).
     */
    public function isConfigured(): bool
    {
        return !empty(config('instagram.access_token'));
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

        try {
            // Instagram Login API: panggil GET /me untuk validasi token
            $resp = Http::timeout(10)->get("{$this->apiBase}/me", [
                'fields'       => 'id,username,account_type',
                'access_token' => $token,
            ]);

            if (!$resp->successful()) {
                $error = $resp->json('error.message') ?? 'API call gagal: HTTP ' . $resp->status();
                return ['ok' => false, 'error' => $error];
            }

            $data = $resp->json();

            return [
                'ok'           => true,
                'username'     => $data['username'] ?? null,
                'account_type' => $data['account_type'] ?? null,
                'expires_at'   => null, // Instagram Login token tidak expose expires_at di /me endpoint
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // ─────────────────────────────────────────────────────────

    private function fetchFromApi(int $limit): array
    {
        $accessToken = config('instagram.access_token');

        try {
            // Instagram Login API: pakai /me/media (token sudah scoped ke user)
            $resp = Http::timeout(10)->get("{$this->apiBase}/me/media", [
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
