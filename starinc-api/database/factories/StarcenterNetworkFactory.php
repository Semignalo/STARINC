<?php

namespace Database\Factories;

use App\Models\StarcenterNetwork;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StarcenterNetworkFactory extends Factory
{
    protected $model = StarcenterNetwork::class;

    public function definition(): array
    {
        return [
            'upline_id'   => User::factory()->asStarcenter(),
            'downline_id' => User::factory(),
            'depth'       => 1,
        ];
    }
}
