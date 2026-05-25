<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('member_id', 20)->nullable()->unique()->after('id');
            $table->string('center_name')->nullable()->after('name');
            $table->string('nik', 16)->nullable()->after('center_name');
            $table->date('birth_date')->nullable()->after('nik');
            $table->string('bank_name', 50)->nullable()->after('postal_code');
            $table->string('bank_account_number', 50)->nullable()->after('bank_name');
            $table->string('bank_account_holder')->nullable()->after('bank_account_number');
            $table->string('bank_branch')->nullable()->after('bank_account_holder');
            $table->string('npwp_number', 30)->nullable()->after('bank_branch');
            $table->string('npwp_holder_name')->nullable()->after('npwp_number');
            $table->string('ig_account')->nullable()->after('npwp_holder_name');
            $table->string('initiator_name')->nullable()->after('ig_account');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'member_id', 'center_name', 'nik', 'birth_date',
                'bank_name', 'bank_account_number', 'bank_account_holder', 'bank_branch',
                'npwp_number', 'npwp_holder_name', 'ig_account', 'initiator_name',
            ]);
        });
    }
};
