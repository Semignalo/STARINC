<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom storage_driver + public_id ke semua tabel yang menyimpan path media.
     * driver: 'local' (default backward-compat) | 'cloudinary'
     * public_id: hanya terisi bila driver=cloudinary
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('main_image_driver', 16)->default('local')->after('main_image');
            $table->string('main_image_public_id')->nullable()->after('main_image_driver');
            $table->string('video_url')->nullable()->after('description');
        });

        Schema::table('product_media', function (Blueprint $table) {
            $table->string('driver', 16)->default('local')->after('file_path');
            $table->string('public_id')->nullable()->after('driver');
        });

        Schema::table('payment_proofs', function (Blueprint $table) {
            $table->string('driver', 16)->default('local')->after('file_path');
            $table->string('public_id')->nullable()->after('driver');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['main_image_driver', 'main_image_public_id', 'video_url']);
        });

        Schema::table('product_media', function (Blueprint $table) {
            $table->dropColumn(['driver', 'public_id']);
        });

        Schema::table('payment_proofs', function (Blueprint $table) {
            $table->dropColumn(['driver', 'public_id']);
        });
    }
};
