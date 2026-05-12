<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('starcenter_applications', function (Blueprint $table) {
            $table->id();

            // Layer 1 — Identitas
            $table->string('center_name')->unique();
            $table->string('full_name');
            $table->date('birth_date');
            $table->string('birth_place');
            $table->enum('gender', ['L', 'P']);
            $table->string('religion');
            $table->string('marital_status');
            $table->string('occupation');
            $table->string('id_card_path');           // KTP photo (private)

            // Layer 2 — Kontak
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('shop_link')->nullable();

            // Layer 3 — Bank & Pajak
            $table->string('bank_name');
            $table->string('bank_number');
            $table->string('bank_account_name');
            $table->string('bank_book_path');         // Buku tabungan (private)
            $table->string('tax_number')->nullable();
            $table->string('tax_doc_path')->nullable(); // Foto NPWP (private)

            // Layer 4 — Referral
            $table->string('referral_code', 8)->nullable();
            $table->foreignId('referrer_id')->nullable()->constrained('users')->nullOnDelete();

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reject_reason')->nullable();

            // Link ke user account setelah approved
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('starcenter_applications');
    }
};
