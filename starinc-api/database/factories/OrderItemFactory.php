<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id'           => Order::factory(),
            'product_id'         => Product::factory(),
            'product_variant_id' => null,
            'product_title'      => fake()->words(3, true),
            'variant_name'       => null,
            'unit_price'         => 100000,
            'quantity'           => 1,
            'line_total'         => 100000,
        ];
    }

    public function forOrder(Order $order): static
    {
        return $this->state(fn() => [
            'order_id' => $order->id,
        ]);
    }

    public function forProduct(Product $product): static
    {
        return $this->state(fn() => [
            'product_id'    => $product->id,
            'product_title' => $product->title,
            'unit_price'    => $product->price,
        ]);
    }

    public function forVariant(ProductVariant $variant): static
    {
        return $this->state(fn() => [
            'product_variant_id' => $variant->id,
            'variant_name'       => $variant->name,
            'unit_price'         => $variant->price,
        ]);
    }

    public function withQuantity(int $quantity): static
    {
        return $this->state(fn(array $attributes) => [
            'quantity'   => $quantity,
            'line_total' => $attributes['unit_price'] * $quantity,
        ]);
    }
}
