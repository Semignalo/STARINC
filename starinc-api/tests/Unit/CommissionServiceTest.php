<?php

namespace Tests\Unit;

use App\Models\Commission;
use App\Models\Order;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\CommissionService;
use Tests\TestCase;

class CommissionServiceTest extends TestCase
{
    private CommissionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CommissionService();
        SystemSetting::setValue('starcenter_first_order_rate', '5');
        SystemSetting::setValue('starcenter_repeat_rate', '1');
    }

    private function makeOrder(User $buyer, float $subtotal, string $status = 'pending_payment'): Order
    {
        return Order::factory()
            ->forUser($buyer)
            ->withSubtotal($subtotal)
            ->create(['status' => $status])
            ->load('user');
    }

    public function test_no_commission_when_buyer_has_no_referrer(): void
    {
        $buyer = User::factory()->create();
        $order = $this->makeOrder($buyer, 500000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 0);
    }

    public function test_no_commission_when_referrer_does_not_exist(): void
    {
        $referrer = User::factory()->create();
        $buyer = User::factory()->withReferrer($referrer)->create();
        $referrer->delete();

        $order = $this->makeOrder($buyer->fresh(), 500000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 0);
    }

    public function test_first_order_rate_is_five_percent(): void
    {
        $referrer = User::factory()->asStarcenter()->create();
        $buyer = User::factory()->withReferrer($referrer)->create();
        $order = $this->makeOrder($buyer, 1000000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 1);
        $this->assertDatabaseHas('commissions', [
            'user_id'           => $referrer->id,
            'order_id'          => $order->id,
            'source_user_id'    => $buyer->id,
            'level'             => 1,
            'commission_rate'   => 5.0,
            'commission_amount' => 50000.00,
            'status'            => 'pending',
        ]);
    }

    public function test_repeat_order_rate_is_one_percent(): void
    {
        $referrer = User::factory()->asStarcenter()->create();
        $buyer = User::factory()->withReferrer($referrer)->create();

        $this->makeOrder($buyer, 1000000, 'completed');

        $order = $this->makeOrder($buyer, 2000000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 1);
        $this->assertDatabaseHas('commissions', [
            'user_id'           => $referrer->id,
            'commission_rate'   => 1.0,
            'commission_amount' => 20000.00,
        ]);
    }

    public function test_no_commission_when_referrer_is_admin(): void
    {
        $referrer = User::factory()->asAdmin()->create();
        $buyer = User::factory()->withReferrer($referrer)->create();
        $order = $this->makeOrder($buyer, 1000000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 0);
    }

    public function test_distribute_is_idempotent(): void
    {
        $referrer = User::factory()->asStarcenter()->create();
        $buyer = User::factory()->withReferrer($referrer)->create();
        $order = $this->makeOrder($buyer, 500000);

        $this->service->distribute($order);
        $this->assertDatabaseCount('commissions', 1);

        $this->service->distribute($order);
        $this->assertDatabaseCount('commissions', 1);
    }

    public function test_cancel_for_order_only_cancels_pending_commissions(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->forUser($user)->create();

        Commission::create([
            'user_id'           => $user->id,
            'order_id'          => $order->id,
            'source_user_id'    => $user->id,
            'order_amount'      => 500000,
            'commission_rate'   => 5,
            'commission_amount' => 25000,
            'level'             => 1,
            'status'            => 'pending',
        ]);
        Commission::create([
            'user_id'           => $user->id,
            'order_id'          => $order->id,
            'source_user_id'    => $user->id,
            'order_amount'      => 500000,
            'commission_rate'   => 1,
            'commission_amount' => 5000,
            'level'             => 1,
            'status'            => 'paid',
        ]);

        $this->service->cancelForOrder($order);

        $this->assertDatabaseCount('commissions', 2);
        $this->assertEquals(1, Commission::where('status', 'cancelled')->count());
        $this->assertEquals(1, Commission::where('status', 'paid')->count());
    }

    public function test_cancel_for_order_does_not_touch_other_orders(): void
    {
        $user = User::factory()->create();
        $orderA = $this->makeOrder($user, 500000);
        $orderB = $this->makeOrder($user, 500000);

        Commission::factory()->create(['order_id' => $orderA->id, 'status' => 'pending']);
        Commission::factory()->create(['order_id' => $orderB->id, 'status' => 'pending']);

        $this->service->cancelForOrder($orderA);

        $this->assertDatabaseHas('commissions', [
            'order_id' => $orderA->id,
            'status'   => 'cancelled',
        ]);
        $this->assertDatabaseHas('commissions', [
            'order_id' => $orderB->id,
            'status'   => 'pending',
        ]);
    }
}
