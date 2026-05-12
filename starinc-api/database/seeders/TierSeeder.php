<?php

namespace Database\Seeders;

use App\Models\Tier;
use Illuminate\Database\Seeder;

class TierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            ['slug' => 'bronze',   'name' => 'Bronze',   'min_spend' => 0,        'discount_percent' => 10, 'sort_order' => 1],
            ['slug' => 'silver',   'name' => 'Silver',   'min_spend' => 5000000,  'discount_percent' => 15, 'sort_order' => 2],
            ['slug' => 'gold',     'name' => 'Gold',     'min_spend' => 10000000, 'discount_percent' => 20, 'sort_order' => 3],
            ['slug' => 'platinum', 'name' => 'Platinum', 'min_spend' => 20000000, 'discount_percent' => 25, 'sort_order' => 4],
            ['slug' => 'diamond',  'name' => 'Diamond',  'min_spend' => 50000000, 'discount_percent' => 30, 'sort_order' => 5],
        ];

        foreach ($tiers as $tier) {
            Tier::updateOrCreate(['slug' => $tier['slug']], $tier);
        }
    }
}
