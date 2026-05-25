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
        'member_id', 'name', 'center_name', 'nik', 'birth_date',
        'email', 'password', 'phone', 'address', 'city', 'postal_code',
        'bank_name', 'bank_account_number', 'bank_account_holder', 'bank_branch',
        'npwp_number', 'npwp_holder_name', 'ig_account', 'initiator_name',
        'role', 'status', 'referrer_id', 'referral_code',
        'cumulative_spending', 'last_transaction_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'birth_date'         => 'date',
            'last_transaction_at'=> 'datetime',
            'password'           => 'hashed',
            'cumulative_spending'=> 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (!$user->referral_code) {
                $user->referral_code = strtoupper(Str::random(8));
            }
            if (!$user->member_id) {
                $user->member_id = self::generateMemberId();
            }
        });
    }

    public static function generateMemberId(): string
    {
        $prefix = 'SC' . now()->format('ym');
        $last = self::where('member_id', 'like', $prefix . '%')
            ->orderByDesc('member_id')
            ->value('member_id');
        $seq = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;
        return $prefix . str_pad((string) $seq, 5, '0', STR_PAD_LEFT);
    }

    // ── Relationships ──

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

    public function downlines(): HasMany
    {
        return $this->hasMany(StarcenterNetwork::class, 'upline_id');
    }

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

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
