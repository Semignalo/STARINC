<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentProof extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'file_path', 'driver', 'public_id', 'admin_notes', 'status', 'reviewed_at'];

    protected $casts = ['reviewed_at' => 'datetime'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
