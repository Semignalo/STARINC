<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('postal_code')->nullable()->after('city');
            $table->enum('role', ['regular', 'starcenter', 'admin'])->default('regular')->after('postal_code');
            $table->foreignId('tier_id')->nullable()->constrained('tiers')->nullOnDelete()->after('role');
            $table->foreignId('referrer_id')->nullable()->constrained('users')->nullOnDelete()->after('tier_id');
            $table->string('referral_code', 8)->unique()->nullable()->after('referrer_id');
            $table->decimal('cumulative_spending', 15, 2)->default(0)->after('referral_code');
            $table->timestamp('last_transaction_at')->nullable()->after('cumulative_spending');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tier_id']);
            $table->dropForeign(['referrer_id']);
            $table->dropColumn([
                'phone', 'address', 'city', 'postal_code', 'role',
                'tier_id', 'referrer_id', 'referral_code',
                'cumulative_spending', 'last_transaction_at'
            ]);
        });
    }
};
