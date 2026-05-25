<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('starcenter_applications', function (Blueprint $table) {
            // Drop fields not in Excel structure
            $table->dropColumn([
                'birth_place', 'gender', 'religion',
                'marital_status', 'occupation', 'shop_link',
            ]);
        });

        Schema::table('starcenter_applications', function (Blueprint $table) {
            // Add new fields aligned with Excel data
            $table->text('address')->nullable()->after('phone');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('bank_branch')->nullable()->after('bank_account_name');
            $table->string('npwp_holder_name')->nullable()->after('tax_number');
            $table->string('ig_account')->nullable()->after('npwp_holder_name');
        });

        // Make birth_date nullable (optional now)
        Schema::table('starcenter_applications', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->change();
        });

        // Expand referral_code to fit SC member_id format
        Schema::table('starcenter_applications', function (Blueprint $table) {
            $table->string('referral_code', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('starcenter_applications', function (Blueprint $table) {
            $table->dropColumn(['address', 'city', 'bank_branch', 'npwp_holder_name', 'ig_account']);
            $table->string('birth_place')->nullable();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->string('religion')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('occupation')->nullable();
            $table->string('shop_link')->nullable();
        });
    }
};
