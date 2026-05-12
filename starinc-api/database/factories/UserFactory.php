<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'regular',
            'cumulative_spending' => 0,
            'last_transaction_at' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function asStarcenter(): static
    {
        return $this->state(fn() => [
            'role' => 'starcenter',
        ]);
    }

    public function asAdmin(): static
    {
        return $this->state(fn() => [
            'role' => 'admin',
        ]);
    }

    public function withReferrer(User $referrer): static
    {
        return $this->state(fn() => [
            'referrer_id' => $referrer->id,
        ]);
    }

    public function withSpending(float $amount): static
    {
        return $this->state(fn() => [
            'cumulative_spending' => $amount,
        ]);
    }

    public function withLastTransaction(?Carbon $at): static
    {
        return $this->state(fn() => [
            'last_transaction_at' => $at,
        ]);
    }

    public function atTier(\App\Models\Tier $tier): static
    {
        return $this->afterCreating(function (User $user) use ($tier) {
            $user->update(['tier_id' => $tier->id]);
        });
    }
}
