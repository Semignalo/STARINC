<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\PaymentProof;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentProofFactory extends Factory
{
    protected $model = PaymentProof::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'file_path' => 'payment-proofs/' . fake()->unique()->sha256() . '.pdf',
            'status'   => 'pending',
            'admin_notes' => null,
            'reviewed_at' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn() => [
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'status' => 'rejected',
            'reviewed_at' => now(),
            'admin_notes' => 'Payment proof rejected',
        ]);
    }
}
