<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Commission settings
            ['key' => 'sdp_commission_rate',       'value' => '5',       'group' => 'commission'],
            ['key' => 'starcenter_level_1_rate',   'value' => '10',      'group' => 'commission'],
            ['key' => 'starcenter_level_2_rate',   'value' => '5',       'group' => 'commission'],
            ['key' => 'starcenter_level_3_rate',   'value' => '3',       'group' => 'commission'],
            ['key' => 'starcenter_level_4_rate',   'value' => '2',       'group' => 'commission'],
            ['key' => 'starcenter_level_5_rate',   'value' => '1.5',     'group' => 'commission'],
            ['key' => 'starcenter_level_6_rate',   'value' => '1',       'group' => 'commission'],
            ['key' => 'starcenter_level_7_rate',   'value' => '0.5',     'group' => 'commission'],
            ['key' => 'starcenter_max_level',      'value' => '7',       'group' => 'commission'],
            ['key' => 'starcenter_moq',            'value' => '5000000', 'group' => 'commission'],

            // General settings
            ['key' => 'flat_shipping_cost',        'value' => '20000',   'group' => 'general'],

            // Tier settings
            ['key' => 'tier_downgrade_days',       'value' => '30',      'group' => 'tier'],

            // Payment settings
            ['key' => 'payment_bank_name',         'value' => 'BCA',     'group' => 'payment'],
            ['key' => 'payment_account_number',    'value' => '888888888', 'group' => 'payment'],
            ['key' => 'payment_account_name',      'value' => 'PT BBK',   'group' => 'payment'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
