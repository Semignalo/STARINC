<?php

namespace App\Console\Commands;

use App\Services\TierService;
use Illuminate\Console\Command;

class CheckTierDowngrades extends Command
{
    protected $signature = 'tier:check-downgrades';
    protected $description = 'Check and downgrade inactive user tiers (run daily)';

    public function handle(TierService $tierService): int
    {
        $this->info('🔍 Checking tier downgrades...');

        $downgraded = $tierService->checkDowngrades();

        $this->info("✅ Done. {$downgraded} user(s) downgraded.");

        return Command::SUCCESS;
    }
}
