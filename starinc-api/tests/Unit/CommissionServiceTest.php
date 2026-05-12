<?php

namespace Tests\Unit;

use App\Models\Commission;
use App\Models\Order;
use App\Models\StarcenterNetwork;
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
    }

    private function makeOrder(User $buyer, float $subtotal): Order
    {
        return Order::factory()
            ->forUser($buyer)
            ->withSubtotal($subtotal)
            ->create()
            ->load('user');
    }

    private function buildNetwork(User $buyer, array $uplines): void
    {
        foreach ($uplines as $depth => $upline) {
            StarcenterNetwork::create([
                'upline_id'   => $upline->id,
                'downline_id' => $buyer->id,
                'depth'       => $depth + 1,
            ]);
        }
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

    public function test_regular_referrer_creates_single_level_commission(): void
    {
        SystemSetting::setValue('sdp_commission_rate', '10');
        $referrer = User::factory()->create(['role' => 'regular']);
        $buyer = User::factory()->withReferrer($referrer)->create();
        $order = $this->makeOrder($buyer, 500000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 1);
        $this->assertDatabaseHas('commissions', [
            'user_id'              => $referrer->id,
            'order_id'             => $order->id,
            'source_user_id'       => $buyer->id,
            'level'                => 1,
            'commission_rate'      => 10.0,
            'commission_amount'    => 50000.00,
            'status'               => 'pending',
        ]);
    }

    public function test_regular_referrer_commission_amount_formula(): void
    {
        SystemSetting::setValue('sdp_commission_rate', '15');
        $referrer = User::factory()->create(['role' => 'regular']);
        $buyer = User::factory()->withReferrer($referrer)->create();
        $order = $this->makeOrder($buyer, 1000000);

        $this->service->distribute($order);

        $commission = Commission::first();
        $expected = round(1000000 * 15 / 100, 2);
        $this->assertEquals($expected, $commission->commission_amount);
    }

    public function test_starcenter_referrer_creates_mlm_commissions_for_each_level(): void
    {
        SystemSetting::setValue('starcenter_level_1_rate', '5');
        SystemSetting::setValue('starcenter_level_2_rate', '3');
        SystemSetting::setValue('starcenter_level_3_rate', '2');

        $l1 = User::factory()->asStarcenter()->create();
        $l2 = User::factory()->asStarcenter()->create();
        $l3 = User::factory()->asStarcenter()->create();
        $buyer = User::factory()->withReferrer($l1)->create();

        $this->buildNetwork($buyer, [$l1, $l2, $l3]);
        $order = $this->makeOrder($buyer, 1000000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 3);

        // Level 1: 1000000 * 5 / 100 = 50000
        $this->assertDatabaseHas('commissions', [
            'user_id' => $l1->id,
            'level'   => 1,
            'commission_amount' => 50000.00,
        ]);

        // Level 2: 1000000 * 3 / 100 = 30000
        $this->assertDatabaseHas('commissions', [
            'user_id' => $l2->id,
            'level'   => 2,
            'commission_amount' => 30000.00,
        ]);

        // Level 3: 1000000 * 2 / 100 = 20000
        $this->assertDatabaseHas('commissions', [
            'user_id' => $l3->id,
            'level'   => 3,
            'commission_amount' => 20000.00,
        ]);
    }

    public function test_mlm_skips_level_with_zero_rate(): void
    {
        SystemSetting::setValue('starcenter_level_1_rate', '5');
        SystemSetting::setValue('starcenter_level_2_rate', '0');
        SystemSetting::setValue('starcenter_level_3_rate', '2');

        $l1 = User::factory()->asStarcenter()->create();
        $l2 = User::factory()->asStarcenter()->create();
        $l3 = User::factory()->asStarcenter()->create();
        $buyer = User::factory()->withReferrer($l1)->create();

        $this->buildNetwork($buyer, [$l1, $l2, $l3]);
        $order = $this->makeOrder($buyer, 1000000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 2);
        $this->assertDatabaseMissing('commissions', ['user_id' => $l2->id]);
    }

    public function test_mlm_respects_max_level_setting(): void
    {
        SystemSetting::setValue('starcenter_max_level', '2');
        SystemSetting::setValue('starcenter_level_1_rate', '5');
        SystemSetting::setValue('starcenter_level_2_rate', '3');
        SystemSetting::setValue('starcenter_level_3_rate', '2');

        $l1 = User::factory()->asStarcenter()->create();
        $l2 = User::factory()->asStarcenter()->create();
        $l3 = User::factory()->asStarcenter()->create();
        $buyer = User::factory()->withReferrer($l1)->create();

        $this->buildNetwork($buyer, [$l1, $l2, $l3]);
        $order = $this->makeOrder($buyer, 1000000);

        $this->service->distribute($order);

        $this->assertDatabaseCount('commissions', 2);
        $this->assertDatabaseMissing('commissions', ['user_id' => $l3->id, 'level' => 3]);
    }

    public function test_distribute_is_idempotent(): void
    {
        SystemSetting::setValue('sdp_commission_rate', '10');
        $referrer = User::factory()->create(['role' => 'regular']);
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
            'user_id'         => $user->id,
            'order_id'        => $order->id,
            'source_user_id'  => $user->id,
            'order_amount'    => 500000,
            'commission_rate' => 5,
            'commission_amount' => 25000,
            'level'           => 1,
            'status'          => 'pending',
        ]);
        Commission::create([
            'user_id'         => $user->id,
            'order_id'        => $order->id,
            'source_user_id'  => $user->id,
            'order_amount'    => 500000,
            'commission_rate' => 3,
            'commission_amount' => 15000,
            'level'           => 2,
            'status'          => 'pending',
        ]);
        Commission::create([
            'user_id'         => $user->id,
            'order_id'        => $order->id,
            'source_user_id'  => $user->id,
            'order_amount'    => 500000,
            'commission_rate' => 2,
            'commission_amount' => 10000,
            'level'           => 3,
            'status'          => 'paid',
        ]);

        $this->service->cancelForOrder($order);

        $this->assertDatabaseCount('commissions', 3);
        $this->assertEquals(2, Commission::where('status', 'cancelled')->count());
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
