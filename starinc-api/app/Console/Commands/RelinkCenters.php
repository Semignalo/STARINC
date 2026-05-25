<?php

namespace App\Console\Commands;

use App\Models\StarcenterNetwork;
use App\Models\User;
use Illuminate\Console\Command;

class RelinkCenters extends Command
{
    protected $signature = 'centers:relink {--dry-run}';

    protected $description = 'Re-link starcenter users to their upline using initiator_name (whitespace-normalized match)';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        // Normalize: lowercase, collapse whitespace, trim
        $norm = fn(?string $s) => $s ? preg_replace('/\s+/', ' ', strtolower(trim($s))) : '';

        // Build lookup of center_name → user (normalized)
        $byCenter = [];
        $byName = [];
        User::whereNotNull('center_name')->orWhereNotNull('name')->get(['id','name','center_name'])
            ->each(function ($u) use (&$byCenter, &$byName, $norm) {
                if ($u->center_name) $byCenter[$norm($u->center_name)] = $u;
                if ($u->name)        $byName[$norm($u->name)]         = $u;
            });

        $admin = User::where('role', 'admin')->first();

        $linked = $skipped = 0;
        $unmatched = [];

        $targets = User::whereNotNull('initiator_name')->whereNull('referrer_id')->get();
        $this->info("Candidates to link: " . $targets->count());

        foreach ($targets as $u) {
            $key = $norm($u->initiator_name);
            $referrer = $byCenter[$key] ?? $byName[$key] ?? null;

            if (!$referrer && (str_contains($key, 'pusat') || str_contains($key, 'management'))) {
                $referrer = $admin;
            }

            if (!$referrer || $referrer->id === $u->id) {
                $skipped++;
                $unmatched[$u->initiator_name] = ($unmatched[$u->initiator_name] ?? 0) + 1;
                continue;
            }

            if (!$dry) {
                $u->update(['referrer_id' => $referrer->id]);
                StarcenterNetwork::firstOrCreate([
                    'upline_id'   => $referrer->id,
                    'downline_id' => $u->id,
                    'depth'       => 1,
                ]);
                foreach (StarcenterNetwork::where('downline_id', $referrer->id)->get() as $up) {
                    if ($up->depth < 7) {
                        StarcenterNetwork::firstOrCreate([
                            'upline_id'   => $up->upline_id,
                            'downline_id' => $u->id,
                            'depth'       => $up->depth + 1,
                        ]);
                    }
                }
            }
            $linked++;
            $this->line("✓ {$u->member_id} → {$referrer->center_name} ({$referrer->member_id})");
        }

        $this->newLine();
        $this->info("Linked: {$linked}  |  Still unmatched: {$skipped}" . ($dry ? '  [DRY-RUN]' : ''));
        if ($unmatched) {
            $this->warn("Unmatched initiators:");
            foreach ($unmatched as $name => $n) $this->line("  {$n}× {$name}");
        }

        return self::SUCCESS;
    }
}
