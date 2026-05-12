<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who earns
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_user_id')->constrained('users')->cascadeOnDelete(); // who shopped
            $table->decimal('order_amount', 15, 2);
            $table->decimal('commission_rate', 5, 2);
            $table->decimal('commission_amount', 15, 2);
            $table->integer('level')->default(1); // 1=direct, 2+= MLM depth
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
        });

        Schema::create('starcenter_network', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upline_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('downline_id')->constrained('users')->cascadeOnDelete();
            $table->integer('depth')->default(1); // 1=direct, 2=indirect, etc.
            $table->timestamps();

            $table->unique(['upline_id', 'downline_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('starcenter_network');
        Schema::dropIfExists('commissions');
    }
};
