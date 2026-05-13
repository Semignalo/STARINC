<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentProof;
use App\Models\StarcenterNetwork;
use App\Models\Commission;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all()->all();
        $centers  = $this->createStarcenters();
        $allUsers = $this->createDownlines($centers);
        $this->createOrders(array_merge($centers, $allUsers), $products);
    }

    private function createStarcenters(): array
    {
        $centerData = [
            ['name' => 'SC Jawa Timur',  'email' => 'sc.jawatimur@starinc.com',  'phone' => '08112222222', 'code' => 'SCJT0001'],
            ['name' => 'SC Jawa Tengah', 'email' => 'sc.jawatengah@starinc.com', 'phone' => '08113333333', 'code' => 'SCJG0001'],
            ['name' => 'SC Jawa Barat',  'email' => 'sc.jawabarat@starinc.com',  'phone' => '08114444444', 'code' => 'SCJB0001'],
        ];

        $centers = [];
        foreach ($centerData as $data) {
            $centers[] = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => Hash::make('password123'),
                    'phone'             => $data['phone'],
                    'role'              => 'starcenter',
                    'status'            => 'active',
                    'referral_code'     => $data['code'],
                    'email_verified_at' => now(),
                ]
            );
        }
        return $centers;
    }

    private function createDownlines(array $centers): array
    {
        $allDownlines = [];

        foreach ($centers as $center) {
            for ($i = 1; $i <= 3; $i++) {
                $downline = User::firstOrCreate(
                    ['email' => "sc.downline.{$center->id}.{$i}@starinc.com"],
                    [
                        'name'              => $center->name . " — Center #{$i}",
                        'password'          => Hash::make('password123'),
                        'phone'             => '0812' . str_pad($center->id, 4, '0', STR_PAD_LEFT) . str_pad($i, 3, '0', STR_PAD_LEFT),
                        'role'              => 'starcenter',
                        'status'            => 'active',
                        'referrer_id'       => $center->id,
                        'email_verified_at' => now(),
                    ]
                );

                StarcenterNetwork::firstOrCreate([
                    'upline_id'   => $center->id,
                    'downline_id' => $downline->id,
                    'depth'       => 1,
                ]);

                $allDownlines[] = $downline;
            }
        }

        return $allDownlines;
    }

    private function createOrders(array $users, array $products): void
    {
        $now = Carbon::now();

        // 80 orders distributed over last 3 months — created directly to bypass MOQ validation
        for ($i = 0; $i < 80; $i++) {
            $user      = $users[rand(0, count($users) - 1)];
            $orderDate = $now->copy()->subDays(rand(0, 90));

            // Build items: 1-4 products, realistic bulk quantities to simulate business order
            $itemCount   = rand(1, 4);
            $subtotal    = 0;
            $orderItems  = [];

            for ($j = 0; $j < $itemCount; $j++) {
                $product  = $products[rand(0, count($products) - 1)];
                $qty      = rand(100, 500); // bulk quantity — starcenter orders large
                $price    = (float) $product->price;
                $lineTotal = round($price * $qty, 2);
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id'    => $product->id,
                    'product_title' => $product->title,
                    'variant_name'  => null,
                    'unit_price'    => $price,
                    'quantity'      => $qty,
                    'line_total'    => $lineTotal,
                ];
            }

            $discountAmount = round($subtotal * 23 / 100, 2);
            $shippingCost   = 20000;
            $total          = $subtotal - $discountAmount + $shippingCost;

            // 70% completed, 15% processing/shipped, 10% pending, 5% rejected
            $rand = rand(1, 100);
            $status = match(true) {
                $rand <= 70 => 'completed',
                $rand <= 85 => ['processing', 'shipped'][rand(0, 1)],
                $rand <= 95 => 'pending_payment',
                default     => 'rejected',
            };

            $orderNumber = 'INV-' . strtoupper(substr(uniqid(), -8));

            $order = Order::create([
                'order_number'     => $orderNumber,
                'user_id'          => $user->id,
                'customer_info'    => [
                    'name'        => $user->name,
                    'phone'       => $user->phone ?? '08100000000',
                    'address'     => 'Jl. Dummy No. ' . rand(1, 999),
                    'city'        => ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta'][rand(0, 4)],
                    'postal_code' => '100' . str_pad(rand(0, 99), 2, '0', STR_PAD_LEFT),
                ],
                'subtotal'         => $subtotal,
                'discount_percent' => 23,
                'discount_amount'  => $discountAmount,
                'shipping_cost'    => $shippingCost,
                'total'            => $total,
                'status'           => $status,
                'created_at'       => $orderDate,
                'updated_at'       => $orderDate,
            ]);

            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            if ($status === 'completed') {
                PaymentProof::create([
                    'order_id'   => $order->id,
                    'file_path'  => 'dummy/proof' . rand(1, 5) . '.jpg',
                    'status'     => 'approved',
                    'reviewed_at'=> $orderDate,
                    'created_at' => $orderDate->copy()->addHours(2),
                ]);

                $spend = $subtotal - $discountAmount;
                $user->increment('cumulative_spending', $spend);
                $user->update(['last_transaction_at' => $orderDate]);

                // Distribute commission to referrer (1 level only)
                if ($user->referrer_id) {
                    $referrer       = User::find($user->referrer_id);
                    $hasPrevOrders  = Order::where('user_id', $user->id)
                        ->where('status', 'completed')
                        ->where('id', '<', $order->id)
                        ->exists();
                    $rate           = $hasPrevOrders ? 1 : 5;

                    Commission::firstOrCreate(
                        ['user_id' => $referrer->id, 'order_id' => $order->id, 'level' => 1],
                        [
                            'source_user_id'   => $user->id,
                            'order_amount'     => $subtotal,
                            'commission_rate'  => $rate,
                            'commission_amount'=> round($subtotal * $rate / 100, 2),
                            'status'           => 'pending',
                        ]
                    );
                }
            }
        }
    }
}
