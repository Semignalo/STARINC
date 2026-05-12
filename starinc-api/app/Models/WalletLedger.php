<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletLedger extends Model
{
    protected $fillable = [
        'user_id', 'type', 'amount', 'description', 'reference_id', 'status',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get total wallet balance for a user.
     * Credit - sum of completed debits.
     */
    public static function getBalance(int $userId): float
    {
        $credits = static::where('user_id', $userId)
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');

        $debits = static::where('user_id', $userId)
            ->where('type', 'debit')
            ->whereIn('status', ['completed', 'pending'])
            ->sum('amount');

        return max(0, (float) $credits - (float) $debits);
    }
}
