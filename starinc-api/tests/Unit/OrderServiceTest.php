<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Product;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\OrderService;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    private OrderService $service;
    private array $customerInfo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OrderService();
        SystemSetting::setValue('flat_shipping_cost', '20000');
        $this->customerInfo = [
            'name'        => 'Test User',
            'phone'       => '08123456789',
            'address'     => 'Jl. Test',
            'city'        => 'Jakarta',
            'postal_code' => '12345',
        ];
    }

    public function test_create_order_uses_db_price(): void
    {
        $product = Product::factory()->priced(150000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder(null, $this->customerInfo, $items);

        $this->assertEquals(150000, $order->items->first()->unit_price);
    }

    public function test_create_order_calculates_subtotal_correctly(): void
    {
        $product = Product::factory()->priced(150000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 2,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder(null, $this->customerInfo, $items);

        $this->assertEquals(300000, $order->subtotal);
        $this->assertEquals(300000, $order->items->first()->line_total);
    }

    public function test_create_order_deducts_stock(): void
    {
        $product = Product::factory()->withStock(10)->priced(100000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 3,
                'variant_id'  => null,
            ],
        ];

        $this->service->createOrder(null, $this->customerInfo, $items);

        $product->refresh();
        $this->assertEquals(7, $product->stock);
    }

    public function test_create_order_does_not_deduct_null_stock(): void
    {
        $product = Product::factory()->priced(100000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 5,
                'variant_id'  => null,
            ],
        ];

        $this->service->createOrder(null, $this->customerInfo, $items);

        $product->refresh();
        $this->assertNull($product->stock);
    }

    public function test_create_order_throws_when_stock_insufficient(): void
    {
        $product = Product::factory()->withStock(2)->priced(100000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 5,
                'variant_id'  => null,
            ],
        ];

        $this->expectException(\Exception::class);
        $this->service->createOrder(null, $this->customerInfo, $items);

        $this->assertDatabaseCount('orders', 0);
        $product->refresh();
        $this->assertEquals(2, $product->stock);
    }

    public function test_create_order_deducts_variant_stock_when_variant_provided(): void
    {
        $product = Product::factory()->create();
        $variant = $product->variants()->create([
            'name'  => 'Test Variant',
            'price' => 150000,
            'stock' => 5,
        ]);

        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 3,
                'variant_id'  => $variant->id,
            ],
        ];

        $this->service->createOrder(null, $this->customerInfo, $items);

        $variant->refresh();
        $this->assertEquals(2, $variant->stock);
    }

    public function test_create_order_applies_flat_discount_for_starcenter(): void
    {
        SystemSetting::setValue('starcenter_discount', '23');
        $user = User::factory()->asStarcenter()->withSpending(50000000)->create();

        $product = Product::factory()->priced(200000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder($user, $this->customerInfo, $items);

        $this->assertEquals(23, (float)$order->discount_percent);
        $this->assertEquals(46000, (float)$order->discount_amount);
    }

    public function test_create_order_no_discount_for_guest(): void
    {
        $product = Product::factory()->priced(200000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder(null, $this->customerInfo, $items);

        $this->assertEquals(0, (float)$order->discount_percent);
        $this->assertEquals(0, (float)$order->discount_amount);
    }

    public function test_create_order_throws_when_starcenter_below_moq(): void
    {
        SystemSetting::setValue('starcenter_moq', '5000000');
        $user = User::factory()->asStarcenter()->create();
        $product = Product::factory()->priced(100000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $this->expectException(\Exception::class);
        try {
            $this->service->createOrder($user, $this->customerInfo, $items);
        } finally {
            $this->assertDatabaseCount('orders', 0);
        }
    }

    public function test_create_order_starcenter_passes_moq_check(): void
    {
        SystemSetting::setValue('starcenter_moq_first', '50000000');
        $user = User::factory()->asStarcenter()->create();
        $product = Product::factory()->priced(60000000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder($user, $this->customerInfo, $items);

        $this->assertDatabaseCount('orders', 1);
        $this->assertGreaterThanOrEqual(50000000, (float)$order->subtotal);
    }

    public function test_create_order_clamps_quantity_to_minimum_one(): void
    {
        $product = Product::factory()->priced(100000)->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 0,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder(null, $this->customerInfo, $items);

        $this->assertEquals(1, $order->items->first()->quantity);
    }

    public function test_create_order_returns_order_with_items_loaded(): void
    {
        $product = Product::factory()->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $order = $this->service->createOrder(null, $this->customerInfo, $items);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertTrue($order->relationLoaded('items'));
    }

    public function test_create_order_updates_user_last_transaction_at(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $user->update(['last_transaction_at' => null]);
        $product = Product::factory()->create();
        $items = [
            [
                'product_id'  => $product->id,
                'quantity'    => 1,
                'variant_id'  => null,
            ],
        ];

        $before = now()->subSecond();
        $this->service->createOrder($user, $this->customerInfo, $items);
        $after = now()->addSeconds(2);

        $user->refresh();
        $this->assertNotNull($user->last_transaction_at);
        $this->assertTrue($user->last_transaction_at->isBetween($before, $after));
    }

    public function test_restore_stock_increments_product_stock(): void
    {
        $product = Product::factory()->withStock(7)->create();
        $order = Order::factory()
            ->create()
            ->load('user');
        $order->items()->create([
            'product_id'           => $product->id,
            'product_variant_id'   => null,
            'product_title'        => $product->title,
            'unit_price'           => $product->price,
            'quantity'             => 3,
            'line_total'           => $product->price * 3,
        ]);

        $this->service->restoreStock($order);

        $product->refresh();
        $this->assertEquals(10, $product->stock);
    }

    public function test_restore_stock_increments_variant_stock_when_variant_present(): void
    {
        $product = Product::factory()->create();
        $variant = $product->variants()->create([
            'name'  => 'Test Variant',
            'price' => 150000,
            'stock' => 5,
        ]);
        $order = Order::factory()
            ->create()
            ->load('user');
        $order->items()->create([
            'product_id'           => $product->id,
            'product_variant_id'   => $variant->id,
            'product_title'        => $product->title,
            'variant_name'         => $variant->name,
            'unit_price'           => $variant->price,
            'quantity'             => 2,
            'line_total'           => $variant->price * 2,
        ]);

        $this->service->restoreStock($order);

        $variant->refresh();
        $this->assertEquals(7, $variant->stock);
    }

    public function test_restore_stock_does_not_touch_null_stock_product(): void
    {
        $product = Product::factory()->create();
        $order = Order::factory()
            ->create()
            ->load('user');
        $order->items()->create([
            'product_id'         => $product->id,
            'product_variant_id' => null,
            'product_title'      => $product->title,
            'unit_price'         => $product->price,
            'quantity'           => 3,
            'line_total'         => $product->price * 3,
        ]);

        $this->service->restoreStock($order);

        $product->refresh();
        $this->assertNull($product->stock);
    }

    public function test_restore_stock_does_not_touch_null_stock_variant(): void
    {
        $product = Product::factory()->create();
        $variant = $product->variants()->create([
            'name'  => 'Test Variant',
            'price' => 150000,
            'stock' => null,
        ]);
        $order = Order::factory()
            ->create()
            ->load('user');
        $order->items()->create([
            'product_id'         => $product->id,
            'product_variant_id' => $variant->id,
            'product_title'      => $product->title,
            'variant_name'       => $variant->name,
            'unit_price'         => $variant->price,
            'quantity'           => 2,
            'line_total'         => $variant->price * 2,
        ]);

        $this->service->restoreStock($order);

        $variant->refresh();
        $this->assertNull($variant->stock);
    }
}
