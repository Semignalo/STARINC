<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan database indexes untuk performa query yang optimal.
     * Task B2 — Production Readiness Phase 1.
     */
    public function up(): void
    {
        // users: referrer_id untuk tree traversal MLM, referral_code untuk lookup
        Schema::table('users', function (Blueprint $table) {
            $table->index('referrer_id', 'idx_users_referrer_id');
            $table->index('referral_code', 'idx_users_referral_code');
        });

        // orders: composite (user_id, status) untuk filter order per user per status
        // order_number untuk lookup invoice
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'idx_orders_user_status');
            $table->index('order_number', 'idx_orders_order_number');
        });

        // commissions: composite (user_id, status) untuk dashboard komisi per user
        Schema::table('commissions', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'idx_commissions_user_status');
        });

        // starcenter_network:
        // (downline_id, depth) untuk fetch entire upline chain dalam 1 query (optimized commission distribution)
        // (upline_id, depth) untuk reverse traversal jika diperlukan
        Schema::table('starcenter_network', function (Blueprint $table) {
            $table->index(['downline_id', 'depth'], 'idx_network_downline_depth');
            $table->index(['upline_id', 'depth'], 'idx_network_upline_depth');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_referrer_id');
            $table->dropIndex('idx_users_referral_code');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user_status');
            $table->dropIndex('idx_orders_order_number');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->dropIndex('idx_commissions_user_status');
        });

        Schema::table('starcenter_network', function (Blueprint $table) {
            $table->dropIndex('idx_network_downline_depth');
            $table->dropIndex('idx_network_upline_depth');
        });
    }
};
