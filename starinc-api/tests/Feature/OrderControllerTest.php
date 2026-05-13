<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\SystemSetting;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class OrderControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        SystemSetting::setValue('flat_shipping_cost', '20000');
        Storage::fake('local');
    }

    public function test_create_order_sukses(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $product = Product::factory()->priced(150000)->create(['stock' => 100]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/checkout', [
                             'customer_info' => [
                                 'name'        => 'John Doe',
                                 'phone'       => '08123456789',
                                 'address'     => 'Jl. Test',
                                 'city'        => 'Jakarta',
                                 'postal_code' => '12345',
                             ],
                             'items' => [
                                 [
                                     'product_id' => $product->id,
                                     'quantity'   => 2,
                                     'variant_id' => null,
                                 ],
                             ],
                         ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => ['message', 'order_number', 'order_id', 'total'],
                 ]);

        $this->assertDatabaseHas('orders', [
            'user_id'     => $user->id,
            'status'      => 'pending_payment',
        ]);
    }

    public function test_create_order_insufficient_stock(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $product = Product::factory()->priced(150000)->create(['stock' => 1]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/checkout', [
                             'customer_info' => [
                                 'name'        => 'John Doe',
                                 'phone'       => '08123456789',
                                 'address'     => 'Jl. Test',
                                 'city'        => 'Jakarta',
                                 'postal_code' => '12345',
                             ],
                             'items' => [
                                 [
                                     'product_id' => $product->id,
                                     'quantity'   => 5,
                                     'variant_id' => null,
                                 ],
                             ],
                         ]);

        $response->assertStatus(422);
    }

    public function test_create_order_below_moq(): void
    {
        $user = User::factory()->asStarcenter()->create();
        $product = Product::factory()->priced(150000)->create(['stock' => 100]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/checkout', [
                             'customer_info' => [
                                 'name'        => 'Starcenter User',
                                 'phone'       => '08123456789',
                                 'address'     => 'Jl. Test',
                                 'city'        => 'Jakarta',
                                 'postal_code' => '12345',
                             ],
                             'items' => [
                                 [
                                     'product_id' => $product->id,
                                     'quantity'   => 1,
                                     'variant_id' => null,
                                 ],
                             ],
                         ]);

        $response->assertStatus(422);
    }

    public function test_create_order_with_variant(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $product = Product::factory()->create(['stock' => 100]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 50, 'price' => 200000]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/checkout', [
                             'customer_info' => [
                                 'name'        => 'John Doe',
                                 'phone'       => '08123456789',
                                 'address'     => 'Jl. Test',
                                 'city'        => 'Jakarta',
                                 'postal_code' => '12345',
                             ],
                             'items' => [
                                 [
                                     'product_id' => $product->id,
                                     'quantity'   => 1,
                                     'variant_id' => $variant->id,
                                 ],
                             ],
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'unit_price' => 200000,
        ]);
    }

    public function test_payment_proof_upload(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $order = Order::factory()->for($user)->create(['status' => 'pending_payment']);
        $token = $user->createToken('auth-token')->plainTextToken;

        $file = UploadedFile::fake()->image('payment.jpg');

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson("/api/orders/{$order->id}/payment-proof", [
                             'file' => $file,
                         ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => ['proof_id', 'status', 'created_at'],
                 ]);

        $this->assertDatabaseHas('payment_proofs', [
            'order_id' => $order->id,
            'status'   => 'pending',
        ]);
    }

    public function test_payment_proof_upload_wrong_status(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $order = Order::factory()->for($user)->create(['status' => 'completed']);
        $token = $user->createToken('auth-token')->plainTextToken;

        $file = UploadedFile::fake()->image('payment.jpg');

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson("/api/orders/{$order->id}/payment-proof", [
                             'file' => $file,
                         ]);

        $response->assertStatus(422);
    }

    public function test_get_invoice(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending_payment',
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson("/api/orders/{$order->order_number}/invoice");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'order' => ['order_number', 'total', 'status'],
                     'payment_config' => ['bank_name', 'account_number', 'account_name'],
                 ]);
    }

    public function test_my_orders(): void
    {
        $user = User::factory()->withSpending(50000000)->create();
        Order::factory()->count(3)->for($user)->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson('/api/user/orders');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         ['id', 'order_number', 'total', 'status'],
                     ],
                 ]);

        $this->assertCount(3, $response->json('data'));
    }
}
