<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Tier;
use App\Models\User;
use App\Models\Commission;
use Tests\TestCase;

class MidtransWebhookTest extends TestCase
{
    private function makePayload(array $overrides = []): array
    {
        $orderId     = $overrides['order_id'] ?? 'INV-TEST0001';
        $statusCode  = $overrides['status_code'] ?? '200';
        $grossAmount = $overrides['gross_amount'] ?? '170000.00';
        $serverKey   = config('services.midtrans.server_key', 'test-server-key');

        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return array_merge([
            'transaction_time'   => '2026-01-01 10:00:00',
            'transaction_status' => 'settlement',
            'transaction_id'     => 'midtrans-txn-uuid-001',
            'status_message'     => 'midtrans payment notification',
            'status_code'        => $statusCode,
            'signature_key'      => $signature,
            'payment_type'       => 'gopay',
            'order_id'           => $orderId,
            'merchant_id'        => 'G999999',
            'gross_amount'       => $grossAmount,
            'fraud_status'       => 'accept',
            'currency'           => 'IDR',
        ], $overrides);
    }

    private function createPendingOrder(string $orderNumber = 'INV-TEST0001'): Order
    {
        $tier = Tier::where('slug', 'bronze')->firstOrFail();
        $user = User::factory()->create(['tier_id' => $tier->id]);

        return Order::create([
            'order_number'    => $orderNumber,
            'user_id'         => $user->id,
            'customer_info'   => ['name' => 'Test User', 'phone' => '081234', 'address' => 'Jl. Test', 'city' => 'Jakarta', 'postal_code' => '12345'],
            'subtotal'        => 150000,
            'discount_percent'=> 0,
            'discount_amount' => 0,
            'shipping_cost'   => 20000,
            'total'           => 170000,
            'status'          => 'pending_payment',
        ]);
    }

    // ── Empty body (Midtrans dashboard ping) ─────────────────────────

    public function test_empty_body_returns_200(): void
    {
        $response = $this->postJson('/api/webhook/midtrans', []);

        $response->assertStatus(200);
    }

    // ── Signature validation ──────────────────────────────────────────

    public function test_invalid_signature_returns_403(): void
    {
        $this->createPendingOrder();

        $payload = $this->makePayload(['signature_key' => 'wrong-signature']);

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(403);
    }

    public function test_unknown_order_returns_200_silently(): void
    {
        $payload = $this->makePayload(['order_id' => 'INV-DOESNOTEXIST']);

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(200);
    }

    // ── Settlement (e.g. GoPay, VA) ──────────────────────────────────

    public function test_settlement_moves_order_to_processing(): void
    {
        $order = $this->createPendingOrder();
        $payload = $this->makePayload([
            'order_id'           => $order->order_number,
            'transaction_status' => 'settlement',
            'payment_type'       => 'gopay',
            'transaction_id'     => 'txn-settle-001',
        ]);

        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id'             => $order->id,
            'status'         => 'processing',
            'payment_method' => 'gopay',
        ]);
    }

    public function test_settlement_updates_cumulative_spending(): void
    {
        $order = $this->createPendingOrder();
        $user  = $order->user;
        $before = $user->cumulative_spending;

        $payload = $this->makePayload(['order_id' => $order->order_number, 'transaction_status' => 'settlement']);
        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        $expectedIncrease = $order->subtotal - $order->discount_amount;
        $this->assertEqualsWithDelta($before + $expectedIncrease, $user->fresh()->cumulative_spending, 0.01);
    }

    // ── Capture (credit card) ─────────────────────────────────────────

    public function test_capture_accept_moves_order_to_processing(): void
    {
        $order = $this->createPendingOrder();
        $payload = $this->makePayload([
            'order_id'           => $order->order_number,
            'transaction_status' => 'capture',
            'fraud_status'       => 'accept',
            'payment_type'       => 'credit_card',
        ]);

        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
    }

    public function test_capture_fraud_deny_rejects_order(): void
    {
        $order = $this->createPendingOrder();
        $payload = $this->makePayload([
            'order_id'           => $order->order_number,
            'transaction_status' => 'capture',
            'fraud_status'       => 'deny',
        ]);

        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'rejected']);
    }

    // ── Failure / Expire ─────────────────────────────────────────────

    public function test_expire_rejects_order(): void
    {
        $tier    = Tier::where('slug', 'bronze')->firstOrFail();
        $user    = User::factory()->create(['tier_id' => $tier->id]);
        $product = Product::factory()->create(['stock' => 10]);

        $order = Order::create([
            'order_number'    => 'INV-EXPIRE01',
            'user_id'         => $user->id,
            'customer_info'   => ['name' => 'Test', 'phone' => '081234', 'address' => 'Jl.', 'city' => 'JKT', 'postal_code' => '11111'],
            'subtotal'        => 100000,
            'discount_percent'=> 0,
            'discount_amount' => 0,
            'shipping_cost'   => 20000,
            'total'           => 120000,
            'status'          => 'pending_payment',
        ]);
        $order->items()->create([
            'product_id'    => $product->id,
            'product_title' => $product->title,
            'unit_price'    => 100000,
            'quantity'      => 2,
            'line_total'    => 200000,
        ]);
        $product->decrement('stock', 2);

        $payload = $this->makePayload([
            'order_id'           => 'INV-EXPIRE01',
            'transaction_status' => 'expire',
            'gross_amount'       => '120000.00',
        ]);

        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        $this->assertDatabaseHas('orders', ['order_number' => 'INV-EXPIRE01', 'status' => 'rejected']);
        $this->assertEquals(10, $product->fresh()->stock); // stock dikembalikan
    }

    // ── Idempotency ───────────────────────────────────────────────────

    public function test_duplicate_webhook_is_idempotent(): void
    {
        $order = $this->createPendingOrder();
        $payload = $this->makePayload(['order_id' => $order->order_number, 'transaction_status' => 'settlement']);

        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);
        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200); // kirim dua kali

        // Status tetap processing, tidak jadi completed atau error
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
    }

    // ── Retry order_id (suffix -timestamp) ───────────────────────────

    public function test_retry_order_id_maps_to_original_order(): void
    {
        $order = $this->createPendingOrder('INV-RETRY001');
        $retryOrderId = 'INV-RETRY001-' . time();

        $payload = $this->makePayload([
            'order_id'           => $retryOrderId,
            'transaction_status' => 'settlement',
            'gross_amount'       => '170000.00',
        ]);

        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
    }
}
