<?php

namespace Database\Factories;

use App\Models\Commission;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommissionFactory extends Factory
{
    protected $model = Commission::class;

    public function definition(): array
    {
        return [
            'user_id'            => User::factory(),
            'order_id'           => Order::factory(),
            'source_user_id'     => User::factory(),
            'order_amount'       => 1000000,
            'commission_rate'    => 5,
            'commission_amount'  => 50000,
            'level'              => 1,
            'status'             => 'pending',
        ];
    }

    public function paid(): static
    {
        return $this->state(fn() => [
            'status' => 'paid',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn() => [
            'status' => 'cancelled',
        ]);
    }
}
