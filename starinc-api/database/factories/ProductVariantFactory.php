<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name'       => fake()->word(),
            'price'      => 150000,
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

    public function forProduct(Product $product): static
    {
        return $this->state(fn() => [
            'product_id' => $product->id,
        ]);
    }
}
