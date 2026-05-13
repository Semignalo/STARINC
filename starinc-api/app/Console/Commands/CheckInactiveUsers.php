<?php

namespace App\Console\Commands;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckInactiveUsers extends Command
{
    protected $signature   = 'app:check-inactive-users';
    protected $description = 'Set starcenter accounts to inactive if no transaction in 3 months';

    public function handle(): int
    {
        $cutoff = Carbon::now()->subMonths(3);

        $count = User::where('role', 'starcenter')
            ->where('status', 'active')
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_transaction_at')
                  ->orWhere('last_transaction_at', '<', $cutoff);
            })
            ->update(['status' => 'inactive']);

        $this->info("Marked {$count} starcenter account(s) as inactive.");
        return self::SUCCESS;
    }
}
