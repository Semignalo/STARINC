<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah field untuk split-section image+title+text yang tampil
 * di ProductDetail page (mirip "the hands" section di Aesop).
 *
 * - feature_image: URL gambar (bisa local atau Cloudinary)
 * - feature_image_driver: 'local' | 'cloudinary' (sama pola dengan main_image)
 * - feature_image_public_id: Cloudinary public_id (nullable)
 * - feature_title: heading section
 * - feature_text: paragraf deskripsi (text panjang, support \n untuk paragraf)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('feature_image')->nullable()->after('packaging');
            $table->string('feature_image_driver', 16)->default('local')->after('feature_image');
            $table->string('feature_image_public_id')->nullable()->after('feature_image_driver');
            $table->string('feature_title')->nullable()->after('feature_image_public_id');
            $table->text('feature_text')->nullable()->after('feature_title');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'feature_image',
                'feature_image_driver',
                'feature_image_public_id',
                'feature_title',
                'feature_text',
            ]);
        });
    }
};
