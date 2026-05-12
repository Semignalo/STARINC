<?php

namespace Database\Factories;

use App\Models\Tier;
use Illuminate\Database\Eloquent\Factories\Factory;

class TierFactory extends Factory
{
    protected $model = Tier::class;

    public function definition(): array
    {
        return [
            'slug'             => $this->faker->unique()->slug(1),
            'name'             => $this->faker->word(),
            'min_spend'        => 0,
            'discount_percent' => 0,
            'sort_order'       => 0,
        ];
    }

    public function bronze(): static
    {
        return $this->state(fn() => [
            'slug'             => 'bronze',
            'name'             => 'Bronze',
            'min_spend'        => 0,
            'discount_percent' => 10,
            'sort_order'       => 1,
        ]);
    }

    public function silver(): static
    {
        return $this->state(fn() => [
            'slug'             => 'silver',
            'name'             => 'Silver',
            'min_spend'        => 5000000,
            'discount_percent' => 15,
            'sort_order'       => 2,
        ]);
    }

    public function gold(): static
    {
        return $this->state(fn() => [
            'slug'             => 'gold',
            'name'             => 'Gold',
            'min_spend'        => 10000000,
            'discount_percent' => 20,
            'sort_order'       => 3,
        ]);
    }
}
