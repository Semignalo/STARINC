<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom stock ke products dan product_variants.
     * Diperlukan untuk validasi dan pengurangan stok saat checkout (Task B4).
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Default null = unlimited stock (produk tanpa tracking stok)
            $table->unsignedInteger('stock')->nullable()->after('is_promo')
                ->comment('null = unlimited, 0 = out of stock');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            // Jika variant punya stok sendiri, ini yang dipakai; null = ikut produk induk
            $table->unsignedInteger('stock')->nullable()->after('price')
                ->comment('null = ikut stok produk, 0 = out of stock');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('stock');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stock');
        });
    }
};
