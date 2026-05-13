<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\Order;
use App\Models\Product;
use App\Models\SystemSetting;
use App\Models\User;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    protected User $admin;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        SystemSetting::setValue('flat_shipping_cost', '20000');
        $this->admin = User::factory()->asAdmin()->create();
        $this->token = $this->admin->createToken('auth-token')->plainTextToken;
    }

    public function test_dashboard_stats(): void
    {
        Order::factory()->count(3)->create(['status' => 'completed', 'total' => 100000]);
        Order::factory()->count(2)->create(['status' => 'pending_payment']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'total_revenue',
                     'active_orders',
                     'total_customers',
                     'pending_payments',
                     'monthly_stats',
                     'top_products',
                     'pending_commissions',
                     'paid_commissions',
                     'recent_orders',
                 ]);

        $this->assertEquals(300000, $response->json('total_revenue'));
    }

    public function test_user_list(): void
    {
        User::factory()->count(5)->create(['role' => 'starcenter']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->getJson('/api/admin/users');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         ['id', 'name', 'email', 'role', 'cumulative_spending'],
                     ],
                 ]);

        $this->assertGreaterThanOrEqual(5, count($response->json('data')));
    }

    public function test_user_detail(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->getJson("/api/admin/users/{$user->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                     ],
                     'network',
                 ]);
    }

    public function test_user_role_update(): void
    {
        $user = User::factory()->create(['role' => 'starcenter']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/users/{$user->id}/role", [
                             'role' => 'admin',
                         ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id'   => $user->id,
            'role' => 'admin',
        ]);
    }

    public function test_user_status_update(): void
    {
        $user = User::factory()->create(['role' => 'starcenter', 'status' => 'active']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/users/{$user->id}/status", [
                             'status' => 'inactive',
                         ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id'     => $user->id,
            'status' => 'inactive',
        ]);
    }

    public function test_user_password_update(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/users/{$user->id}/password", [
                             'password'              => 'newpassword12345',
                             'password_confirmation' => 'newpassword12345',
                         ]);

        $response->assertStatus(200);

        // Verify new password works
        $loginResponse = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'newpassword12345',
        ]);

        $loginResponse->assertStatus(200);
    }

    public function test_order_list_admin(): void
    {
        Order::factory()->count(5)->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->getJson('/api/admin/orders');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         ['id', 'order_number', 'total', 'status'],
                     ],
                 ]);
    }

    public function test_order_status_admin_change(): void
    {
        $order = Order::factory()->create(['status' => 'pending_payment']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/orders/{$order->id}/status", [
                             'status' => 'processing',
                         ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => 'processing',
        ]);
    }

    public function test_order_payment_review_approve(): void
    {
        $order = Order::factory()->create(['status' => 'pending_payment']);
        \App\Models\PaymentProof::factory()->for($order)->create(['status' => 'pending']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/orders/{$order->id}/payment", [
                             'status' => 'approved',
                             'notes'  => 'Payment verified',
                         ]);

        $response->assertStatus(200);
    }

    public function test_order_tracking_update(): void
    {
        $order = Order::factory()->create(['status' => 'shipped']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/orders/{$order->id}/tracking", [
                             'tracking_number' => 'JNE123456',
                         ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id'               => $order->id,
            'tracking_number'  => 'JNE123456',
        ]);
    }

    public function test_commission_list(): void
    {
        Commission::factory()->count(5)->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->getJson('/api/admin/commissions');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         ['id', 'user_id', 'commission_amount', 'status'],
                     ],
                 ]);
    }

    public function test_commission_pay(): void
    {
        $commission = Commission::factory()->create(['status' => 'pending']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->putJson("/api/admin/commissions/{$commission->id}/pay");

        $response->assertStatus(200);

        $this->assertDatabaseHas('commissions', [
            'id'     => $commission->id,
            'status' => 'paid',
        ]);
    }

    public function test_commission_bulk_pay(): void
    {
        $commissions = Commission::factory()->count(3)->create(['status' => 'pending']);
        $ids = $commissions->pluck('id')->toArray();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->postJson('/api/admin/commissions/bulk-pay', [
                             'commission_ids' => $ids,
                         ]);

        $response->assertStatus(200);

        foreach ($ids as $id) {
            $this->assertDatabaseHas('commissions', [
                'id'     => $id,
                'status' => 'paid',
            ]);
        }
    }

    public function test_export_orders(): void
    {
        Order::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->get('/api/admin/orders/export');

        $response->assertStatus(200)
                 ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_export_commissions(): void
    {
        Commission::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->get('/api/admin/commissions/export');

        $response->assertStatus(200)
                 ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_unauthorized_access(): void
    {
        $user = User::factory()->create(['role' => 'starcenter']);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_user_commissions(): void
    {
        $user = User::factory()->create();
        Commission::factory()->count(3)->for($user)->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
                         ->getJson("/api/admin/users/{$user->id}/commissions");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         ['id', 'commission_amount', 'status'],
                     ],
                 ]);

        $this->assertCount(3, $response->json('data'));
    }
}
