<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'title'      => fake()->words(3, true),
            'price'      => 100000,
            'category'   => 'Test',
            'is_promo'   => false,
            'sort_order' => 0,
            'stock'      => null,
        ];
    }

    public function withStock(int $quantity): static
    {
        return $this->state(fn() => [
            'stock' => $quantity,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn() => [
            'stock' => 0,
        ]);
    }

    public function priced(float $price): static
    {
        return $this->state(fn() => [
            'price' => $price,
        ]);
    }
}
