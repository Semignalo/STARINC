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
    private string $apiBase;
    private string $apiBaseNoVersion = 'https://graph.instagram.com';

    // Cache keys untuk token yang di-refresh oleh sistem (di luar .env)
    const TOKEN_CACHE_KEY      = 'instagram:active_token';
    const EXPIRES_AT_CACHE_KEY = 'instagram:token_expires_at';

    public function __construct()
    {
        $version = config('instagram.api_version', 'v21.0');
        $this->apiBase = "https://graph.instagram.com/{$version}";
    }

    /**
     * Token aktif: token hasil refresh terbaru (cache) > token dari .env.
     * Pattern: user isi .env sekali, sistem refresh & simpan token baru di cache.
     */
    public function getActiveToken(): ?string
    {
        return Cache::get(self::TOKEN_CACHE_KEY) ?: config('instagram.access_token');
    }

    /**
     * Timestamp kapan token expire (Unix seconds). Null bila belum pernah refresh.
     */
    public function getExpiresAt(): ?int
    {
        return Cache::get(self::EXPIRES_AT_CACHE_KEY);
    }

    /**
     * Sisa hari sampai token expired. Null bila belum pernah refresh.
     */
    public function getDaysRemaining(): ?int
    {
        $expiresAt = $this->getExpiresAt();
        if (!$expiresAt) return null;
        return max(0, (int) ceil(($expiresAt - time()) / 86400));
    }

    public function isConfigured(): bool
    {
        return !empty($this->getActiveToken());
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
        $token = $this->getActiveToken();
        if (empty($token)) {
            return ['ok' => false, 'error' => 'INSTAGRAM_ACCESS_TOKEN belum diisi di .env'];
        }

        try {
            $resp = Http::timeout(10)->get("{$this->apiBase}/me", [
                'fields'       => 'id,username,account_type',
                'access_token' => $token,
            ]);

            if (!$resp->successful()) {
                $error = $resp->json('error.message') ?? 'API call gagal: HTTP ' . $resp->status();
                return ['ok' => false, 'error' => $error];
            }

            $data = $resp->json();
            $expiresAt = $this->getExpiresAt();

            return [
                'ok'             => true,
                'username'       => $data['username'] ?? null,
                'account_type'   => $data['account_type'] ?? null,
                'expires_at'     => $expiresAt ? date('c', $expiresAt) : null,
                'days_remaining' => $this->getDaysRemaining(),
                'using_refreshed_token' => Cache::has(self::TOKEN_CACHE_KEY),
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Refresh Instagram Login token.
     *
     * Endpoint: GET /refresh_access_token?grant_type=ig_refresh_token&access_token=...
     * Response: { access_token, token_type, expires_in (seconds) }
     *
     * Token harus minimal 24 jam umurnya untuk bisa di-refresh.
     * Refresh memperpanjang masa berlaku menjadi 60 hari dari saat refresh.
     */
    public function refreshToken(): array
    {
        $token = $this->getActiveToken();
        if (empty($token)) {
            return ['ok' => false, 'error' => 'Tidak ada token untuk di-refresh'];
        }

        try {
            $resp = Http::timeout(15)->get("{$this->apiBaseNoVersion}/refresh_access_token", [
                'grant_type'   => 'ig_refresh_token',
                'access_token' => $token,
            ]);

            if (!$resp->successful()) {
                $err = $resp->json('error.message') ?? 'Refresh gagal: HTTP ' . $resp->status();
                Log::warning('Instagram refresh_access_token failed', ['body' => $resp->json()]);
                return ['ok' => false, 'error' => $err];
            }

            $data = $resp->json();
            $newToken  = $data['access_token'] ?? null;
            $expiresIn = (int) ($data['expires_in'] ?? 0);

            if (!$newToken || $expiresIn <= 0) {
                return ['ok' => false, 'error' => 'Response refresh tidak valid'];
            }

            $expiresAt = time() + $expiresIn;

            // Simpan ke cache forever (60 hari validity, kita pakai longer cache untuk safety)
            Cache::forever(self::TOKEN_CACHE_KEY, $newToken);
            Cache::forever(self::EXPIRES_AT_CACHE_KEY, $expiresAt);

            // Bust posts cache karena pakai token baru (technically masih valid, but be safe)
            Cache::forget("instagram:posts:limit=" . config('instagram.feed_limit', 5));

            return [
                'ok'         => true,
                'expires_in' => $expiresIn,
                'expires_at' => date('c', $expiresAt),
                'days_remaining' => (int) ceil($expiresIn / 86400),
            ];
        } catch (\Throwable $e) {
            Log::error('Instagram refresh error', ['msg' => $e->getMessage()]);
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // ─────────────────────────────────────────────────────────

    private function fetchFromApi(int $limit): array
    {
        $accessToken = $this->getActiveToken();

        try {
            // Instagram Login API: pakai /me/media (token sudah scoped ke user)
            // children{} expansion: dapat semua item carousel sekaligus dalam 1 request
            $resp = Http::timeout(15)->get("{$this->apiBase}/me/media", [
                'fields'       => 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,children{id,media_type,media_url,thumbnail_url}',
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

            return array_map(fn($item) => $this->normalizeItem($item), $items);
        } catch (\Throwable $e) {
            Log::error('Instagram fetch error', ['msg' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Normalize 1 media item ke shape internal yang konsisten.
     */
    private function normalizeItem(array $item): array
    {
        $type = strtolower($item['media_type'] ?? 'image');

        // Children untuk carousel album
        $children = [];
        if ($type === 'carousel_album' && !empty($item['children']['data'])) {
            $children = array_map(function ($child) {
                $childType = strtolower($child['media_type'] ?? 'image');
                return [
                    'id'    => $child['id'] ?? null,
                    'type'  => $childType,
                    'image' => $child['thumbnail_url'] ?? $child['media_url'] ?? null,
                    'video' => $childType === 'video' ? ($child['media_url'] ?? null) : null,
                ];
            }, $item['children']['data']);
        }

        return [
            'id'        => $item['id'] ?? null,
            'type'      => $type,
            // Thumbnail/preview untuk grid (always image)
            'image'     => $item['thumbnail_url'] ?? $item['media_url'] ?? null,
            // Video URL untuk single video post
            'video'     => $type === 'video' ? ($item['media_url'] ?? null) : null,
            // Carousel children (urut sesuai posting)
            'children'  => $children,
            'permalink' => $item['permalink'] ?? null,
            'caption'   => $item['caption'] ?? '',
            'timestamp' => $item['timestamp'] ?? null,
        ];
    }
}
