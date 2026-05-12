<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_courier', 20)->nullable()->after('shipping_cost');    // jne / pos / tiki
            $table->string('shipping_service', 30)->nullable()->after('shipping_courier'); // REG, YES, ONS, dll
            $table->unsignedInteger('destination_city_id')->nullable()->after('shipping_service');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_courier', 'shipping_service', 'destination_city_id']);
        });
    }
};
