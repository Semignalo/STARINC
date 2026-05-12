<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tier;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $diamondTier = Tier::where('slug', 'diamond')->first();

        User::updateOrCreate(
            ['email' => 'admin@starinc.id'],
            [
                'name' => 'Admin Starinc',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'tier_id' => $diamondTier?->id,
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]
        );
    }
}
