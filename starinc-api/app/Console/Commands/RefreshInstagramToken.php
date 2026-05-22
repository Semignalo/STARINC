<?php

namespace App\Console\Commands;

use App\Services\InstagramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Refresh Instagram Login token agar tidak expired (60 hari).
 *
 * Dijalankan otomatis via schedule mingguan. Token baru disimpan di cache
 * (forever), service akan pakai cache token > config .env.
 *
 * Behaviour:
 * - Skip bila days_remaining > 14 hari (no need to refresh yet)
 * - Refresh bila days_remaining <= 14 hari ATAU belum pernah refresh
 *
 * Cara pakai manual:
 *   php artisan instagram:refresh-token              # refresh bila perlu
 *   php artisan instagram:refresh-token --force      # paksa refresh sekarang
 */
class RefreshInstagramToken extends Command
{
    protected $signature = 'instagram:refresh-token {--force : Paksa refresh tanpa cek expiry}';
    protected $description = 'Refresh Instagram Login token (perpanjang 60 hari)';

    public function handle(InstagramService $instagram): int
    {
        if (!$instagram->isConfigured()) {
            $this->warn('Instagram token belum dikonfigurasi di .env. Skip.');
            return self::SUCCESS;
        }

        $force         = (bool) $this->option('force');
        $daysRemaining = $instagram->getDaysRemaining();

        // Skip kalau masih ada banyak waktu (dan tidak --force)
        if (!$force && $daysRemaining !== null && $daysRemaining > 14) {
            $this->info("Token masih valid {$daysRemaining} hari. Skip refresh.");
            return self::SUCCESS;
        }

        $this->info('Refreshing Instagram token…');
        $result = $instagram->refreshToken();

        if (!$result['ok']) {
            $this->error('Gagal refresh: ' . ($result['error'] ?? 'unknown'));
            Log::error('Instagram token refresh failed (cron)', $result);
            return self::FAILURE;
        }

        $this->info("Token berhasil di-refresh. Berlaku {$result['days_remaining']} hari ({$result['expires_at']}).");
        return self::SUCCESS;
    }
}
