<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StarcenterApplication extends Model
{
    protected $fillable = [
        'center_name',
        'full_name',
        'birth_date',
        'birth_place',
        'gender',
        'religion',
        'marital_status',
        'occupation',
        'nik',
        'id_card_path',
        'email',
        'phone',
        'shop_link',
        'bank_name',
        'bank_number',
        'bank_account_name',
        'bank_book_path',
        'tax_number',
        'tax_doc_path',
        'referral_code',
        'referrer_id',
        'status',
        'reject_reason',
        'user_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
