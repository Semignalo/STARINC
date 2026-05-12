<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\StarcenterNetwork;
use App\Services\OrderService;
use App\Services\CommissionService;
use App\Services\TierService;
use App\Models\Tier;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(OrderService $orderService, CommissionService $commissionService, TierService $tierService): void
    {
        // Get tiers
        $tiers = [
            'bronze' => Tier::where('slug', 'bronze')->first(),
            'silver' => Tier::where('slug', 'silver')->first(),
            'gold' => Tier::where('slug', 'gold')->first(),
            'platinum' => Tier::where('slug', 'platinum')->first(),
            'diamond' => Tier::where('slug', 'diamond')->first(),
        ];

        // Create 20+ products
        $products = $this->createProducts();

        // Create SDP admin account (if not exists)
        $admin = User::where('email', 'admin@sdp.com')->first();

        // Create Starcenter accounts (multiple)
        $centers = $this->createStarcenters($tiers);

        // Create multi-level network
        $allUsers = $this->createNetwork($centers, $tiers);

        // Create many orders with different statuses
        $this->createOrders($allUsers, $products, $orderService, $commissionService, $tierService);
    }

    private function createProducts(): array
    {
        $productData = [
            ['title' => 'Starinc Whitening Serum', 'price' => 150000, 'category' => 'Skincare', 'desc' => 'Premium whitening serum'],
            ['title' => 'Starinc Night Cream', 'price' => 120000, 'category' => 'Skincare', 'desc' => 'Night recovery cream'],
            ['title' => 'Starinc Facial Wash', 'price' => 80000, 'category' => 'Skincare', 'desc' => 'Gentle facial cleanser'],
            ['title' => 'Starinc Toner', 'price' => 95000, 'category' => 'Skincare', 'desc' => 'Balancing toner'],
            ['title' => 'Starinc Eye Cream', 'price' => 180000, 'category' => 'Skincare', 'desc' => 'Anti-aging eye cream'],
            ['title' => 'Starinc Mask', 'price' => 110000, 'category' => 'Skincare', 'desc' => 'Sheet mask pack'],
            ['title' => 'Starinc Sunscreen SPF50', 'price' => 125000, 'category' => 'Skincare', 'desc' => 'UV protection'],
            ['title' => 'Starinc Lip Balm', 'price' => 60000, 'category' => 'Lip Care', 'desc' => 'Moisturizing lip balm'],
            ['title' => 'Starinc Hair Serum', 'price' => 140000, 'category' => 'Hair Care', 'desc' => 'Hair strengthening serum'],
            ['title' => 'Starinc Shampoo', 'price' => 85000, 'category' => 'Hair Care', 'desc' => 'Keratin shampoo'],
            ['title' => 'Starinc Conditioner', 'price' => 85000, 'category' => 'Hair Care', 'desc' => 'Deep conditioning treatment'],
            ['title' => 'Starinc Body Lotion', 'price' => 100000, 'category' => 'Body Care', 'desc' => 'Moisturizing body lotion'],
            ['title' => 'Starinc Hand Cream', 'price' => 75000, 'category' => 'Body Care', 'desc' => 'Anti-aging hand care'],
            ['title' => 'Starinc Bath Bomb', 'price' => 45000, 'category' => 'Bath & Spa', 'desc' => 'Aromatic bath bomb'],
            ['title' => 'Starinc Face Mist', 'price' => 70000, 'category' => 'Skincare', 'desc' => 'Hydrating face mist'],
            ['title' => 'Starinc Vitamin C Essence', 'price' => 160000, 'category' => 'Skincare', 'desc' => 'Brightening essence'],
            ['title' => 'Starinc Hyaluronic Serum', 'price' => 135000, 'category' => 'Skincare', 'desc' => 'Deep hydration serum'],
            ['title' => 'Starinc Peptide Cream', 'price' => 175000, 'category' => 'Skincare', 'desc' => 'Anti-wrinkle peptide cream'],
            ['title' => 'Starinc Sleeping Mask', 'price' => 130000, 'category' => 'Skincare', 'desc' => 'Overnight treatment mask'],
            ['title' => 'Starinc Facial Oil', 'price' => 145000, 'category' => 'Skincare', 'desc' => 'Luxurious facial oil'],
            ['title' => 'Starinc Cleansing Balm', 'price' => 115000, 'category' => 'Skincare', 'desc' => 'Make-up remover balm'],
            ['title' => 'Starinc Exfoliator', 'price' => 90000, 'category' => 'Skincare', 'desc' => 'Gentle exfoliating scrub'],
        ];

        $products = [];
        foreach ($productData as $pd) {
            $products[] = Product::firstOrCreate(
                ['title' => $pd['title']],
                [
                    'description' => $pd['desc'],
                    'price' => $pd['price'],
                    'category' => $pd['category'],
                ]
            );
        }
        return $products;
    }

    private function createStarcenters($tiers): array
    {
        $centers = [];
        $centerData = [
            ['name' => 'SC Jawa Timur', 'email' => 'sc.jawatimur@starinc.com', 'phone' => '08112222222', 'code' => 'SCJT001'],
            ['name' => 'SC Jawa Tengah', 'email' => 'sc.jawatengah@starinc.com', 'phone' => '08113333333', 'code' => 'SCJG001'],
            ['name' => 'SC Jawa Barat', 'email' => 'sc.jawabarat@starinc.com', 'phone' => '08114444444', 'code' => 'SCJB001'],
        ];

        foreach ($centerData as $data) {
            $center = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password123'),
                    'phone' => $data['phone'],
                    'role' => 'starcenter',
                    'tier_id' => $tiers['diamond']->id,
                    'referral_code' => $data['code'],
                    'email_verified_at' => now(),
                ]
            );
            $centers[] = $center;
        }
        return $centers;
    }

    private function createNetwork($centers, $tiers): array
    {
        $allUsers = $centers;

        foreach ($centers as $center) {
            // Each center has exactly 3 downlines (level 1)
            for ($i = 1; $i <= 3; $i++) {
                $downline1 = User::firstOrCreate(
                    ['email' => "downline.{$center->id}.{$i}@starinc.com"],
                    [
                        'name' => $center->name . " - Downline #{$i}",
                        'password' => Hash::make('password123'),
                        'phone' => '0812' . str_pad($center->id, 4, '0', STR_PAD_LEFT) . str_pad($i, 3, '0', STR_PAD_LEFT),
                        'role' => 'regular',
                        'referrer_id' => $center->id,
                        'tier_id' => $tiers['bronze']->id,
                        'email_verified_at' => now(),
                    ]
                );
                StarcenterNetwork::firstOrCreate([
                    'upline_id' => $center->id,
                    'downline_id' => $downline1->id,
                    'depth' => 1
                ]);
                $allUsers[] = $downline1;
            }
        }
        return $allUsers;
    }

    private function createOrders($users, $products, OrderService $orderService, CommissionService $commissionService, TierService $tierService): void
    {
        $statuses = ['pending_payment', 'processing', 'shipped', 'completed', 'rejected'];
        $now = Carbon::now();

        // Create 100+ orders distributed over last 3 months
        for ($i = 0; $i < 120; $i++) {
            // Pick random user (skip first few admin users)
            $user = $users[rand(4, count($users) - 1)];

            // Random date in last 3 months
            $orderDate = $now->copy()->subDays(rand(0, 90));

            // Random items
            $itemCount = rand(1, 4);
            $items = [];
            for ($j = 0; $j < $itemCount; $j++) {
                $items[] = [
                    'product_id' => $products[rand(0, count($products) - 1)]->id,
                    'quantity' => rand(1, 3)
                ];
            }

            // Create order
            $customerInfo = [
                'name' => $user->name,
                'phone' => $user->phone,
                'address' => 'Jl. Dummy No. ' . rand(1, 999),
                'city' => ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta'][rand(0, 4)],
                'postal_code' => '1000' . str_pad(rand(0, 999), 2, '0', STR_PAD_LEFT)
            ];

            $order = $orderService->createOrder($user, $customerInfo, $items);
            $order->update(['created_at' => $orderDate, 'updated_at' => $orderDate]);

            // 70% completed, 15% processing/shipped, 10% pending, 5% rejected
            $rand = rand(1, 100);
            if ($rand <= 70) {
                $status = 'completed';
            } elseif ($rand <= 85) {
                $status = ['processing', 'shipped'][rand(0, 1)];
            } elseif ($rand <= 95) {
                $status = 'pending_payment';
            } else {
                $status = 'rejected';
            }

            if ($status === 'completed') {
                // Add payment proof
                PaymentProof::create([
                    'order_id' => $order->id,
                    'file_path' => 'dummy/proof' . rand(1, 5) . '.jpg',
                    'status' => 'approved',
                    'reviewed_at' => $orderDate,
                    'created_at' => $orderDate->copy()->addHours(2),
                ]);

                $order->update(['status' => 'completed']);

                // Update cumulative spending
                $productSpend = $order->subtotal - $order->discount_amount;
                $user->increment('cumulative_spending', $productSpend);
                $user->update(['last_transaction_at' => $orderDate]);

                // Evaluate tier
                $tierService->evaluateUpgrade($user->fresh());

                // Distribute commissions
                $commissionService->distribute($order);
            } else {
                $order->update(['status' => $status]);
            }
        }
    }
}
