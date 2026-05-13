<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@starinc.id'],
            [
                'name' => 'Admin Starinc',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]
        );
    }
}
