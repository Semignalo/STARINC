<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TierSeeder::class,
            SystemSettingSeeder::class,
            AppearanceSeeder::class,
            AdminUserSeeder::class,
            ProductCatalogSeeder::class,
            DummyDataSeeder::class,
        ]);
    }
}
