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
        Schema::create('tb_layanan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_layanan');
            $table->string('slug')->unique();
            $table->string('kategori_layanan'); // Maintenance, Upgrade, Hardware, Software, Diagnosa
            $table->text('deskripsi');
            $table->string('estimasi_waktu'); // '1 - 2 Jam', '1 Hari Kerja'
            $table->string('garansi'); // '1 Bulan', '3 Bulan', 'Garansi Cek'
            $table->bigInteger('biaya_mulai_dari')->default(0);
            $table->string('icon')->nullable(); // Lucide icon
            $table->text('keuntungan')->nullable(); // JSON atau baris-baris benefit
            $table->enum('is_aktif', ['true', 'false'])->default('true');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_layanan');
    }
};
