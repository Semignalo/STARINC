<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'address', 'city', 'postal_code',
        'role', 'tier_id', 'referrer_id', 'referral_code',
        'cumulative_spending', 'last_transaction_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_transaction_at' => 'datetime',
            'password' => 'hashed',
            'cumulative_spending' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        // Auto-generate referral code on creation
        static::creating(function (User $user) {
            if (!$user->referral_code) {
                $user->referral_code = strtoupper(Str::random(8));
            }
            // Default tier = bronze (id=1) if not set
            if (!$user->tier_id) {
                $bronzeTier = Tier::where('slug', 'bronze')->first();
                if ($bronzeTier) {
                    $user->tier_id = $bronzeTier->id;
                }
            }
        });
    }

    // ── Relationships ──

    public function tier(): BelongsTo
    {
        return $this->belongsTo(Tier::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referrer_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function walletLedgers(): HasMany
    {
        return $this->hasMany(WalletLedger::class);
    }

    // Starcenter network: users I recruited
    public function downlines(): HasMany
    {
        return $this->hasMany(StarcenterNetwork::class, 'upline_id');
    }

    // Starcenter network: who recruited me
    public function uplines(): HasMany
    {
        return $this->hasMany(StarcenterNetwork::class, 'downline_id');
    }

    // ── Helpers ──

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStarcenter(): bool
    {
        return $this->role === 'starcenter';
    }
}
