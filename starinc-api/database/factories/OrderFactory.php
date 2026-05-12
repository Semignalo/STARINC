<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id'          => null,
            'customer_info'    => [
                'name'        => fake()->name(),
                'phone'       => '08123456789',
                'address'     => fake()->address(),
                'city'        => 'Jakarta',
                'postal_code' => '12345',
            ],
            'subtotal'         => 500000,
            'discount_percent' => 0,
            'discount_amount'  => 0,
            'shipping_cost'    => 20000,
            'total'            => 520000,
            'status'           => 'pending_payment',
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn() => [
            'user_id' => $user->id,
        ]);
    }

    public function withSubtotal(float $subtotal): static
    {
        return $this->state(fn() => [
            'subtotal' => $subtotal,
            'total'    => $subtotal + 20000,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn() => [
            'status' => 'completed',
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'status' => 'rejected',
        ]);
    }
}
