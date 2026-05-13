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
            ['key' => 'starcenter_first_order_rate', 'value' => '5',        'group' => 'commission'],
            ['key' => 'starcenter_repeat_rate',      'value' => '1',        'group' => 'commission'],
            ['key' => 'starcenter_moq_first',        'value' => '50000000', 'group' => 'commission'],
            ['key' => 'starcenter_discount',         'value' => '23',       'group' => 'commission'],

            // General settings
            ['key' => 'flat_shipping_cost',          'value' => '20000',    'group' => 'general'],

            // Payment settings
            ['key' => 'payment_bank_name',           'value' => 'BCA',      'group' => 'payment'],
            ['key' => 'payment_account_number',      'value' => '888888888','group' => 'payment'],
            ['key' => 'payment_account_name',        'value' => 'PT STARINC','group' => 'payment'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
