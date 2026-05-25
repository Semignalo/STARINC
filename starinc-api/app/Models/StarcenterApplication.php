<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StarcenterApplication extends Model
{
    protected $fillable = [
        'center_name',
        'full_name',
        'birth_date',
        'nik',
        'id_card_path',
        'email',
        'phone',
        'address',
        'city',
        'bank_name',
        'bank_number',
        'bank_account_name',
        'bank_branch',
        'bank_book_path',
        'tax_number',
        'npwp_holder_name',
        'tax_doc_path',
        'ig_account',
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
