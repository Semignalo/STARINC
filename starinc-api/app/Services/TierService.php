<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\Tier;
use App\Models\User;

class TierService
{
    /**
     * Evaluate and upgrade a user's tier based on cumulative spending.
     * Called when an order is completed.
     */
    public function evaluateUpgrade(User $user): void
    {
        // Starcenter and admin tiers are locked
        if (in_array($user->role, ['starcenter', 'admin'])) {
            return;
        }

        $tiers = Tier::orderBy('min_spend', 'desc')->get();

        foreach ($tiers as $tier) {
            if ($user->cumulative_spending >= $tier->min_spend) {
                if ($user->tier_id !== $tier->id) {
                    $user->tier_id = $tier->id;
                    $user->save();
                }

                return;
            }
        }
    }

    /**
     * Check and process tier downgrades for inactive users.
     * Called daily by the CheckTierDowngrades command.
     */
    public function checkDowngrades(): int
    {
        $days = (int) SystemSetting::getValue('tier_downgrade_days', 30);
        $downgraded = 0;

        $users = User::where('role', 'regular')
            ->whereNotNull('last_transaction_at')
            ->where('last_transaction_at', '<', now()->subDays($days))
            ->with('tier')
            ->get();

        $tiers = Tier::orderBy('sort_order')->get();
        $tierIds = $tiers->pluck('id')->toArray();
        $bronzeTierId = $tiers->first()?->id;

        foreach ($users as $user) {
            $daysSinceLast = $user->last_transaction_at->diffInDays(now());
            $dropCount = intdiv($daysSinceLast, $days);

            $currentIndex = array_search($user->tier_id, $tierIds);

            if ($currentIndex === false || $currentIndex === 0) {
                continue; // Already at lowest tier
            }

            $newIndex = max(0, $currentIndex - $dropCount);

            if ($newIndex !== $currentIndex) {
                $user->tier_id = $tierIds[$newIndex];
                // B6 FIX: JANGAN reset last_transaction_at setelah downgrade.
                // Reset ke now() menyebabkan user tidak bisa didowngrade lagi selama 30 hari berikutnya,
                // padahal tidak ada transaksi baru. Timer harus tetap berjalan dari tanggal transaksi terakhir asli.
                $user->save();
                $downgraded++;
            }
        }

        return $downgraded;
    }
}
