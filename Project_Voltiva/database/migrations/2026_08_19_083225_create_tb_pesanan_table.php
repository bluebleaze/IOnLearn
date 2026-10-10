<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengguna_id')->constrained('tb_pengguna')->onDelete('cascade');
            $table->bigInteger('total_harga');
            $table->text('alamat_pengiriman');
            $table->enum('status_pembayaran', ['pending', 'dibayar', 'selesai', 'dibatalkan'])->default('pending');
            $table->enum('status_pengiriman', ['dipersiapkan', 'dikirim', 'selesai', 'dibatalkan'])->default('dipersiapkan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_pesanan');
    }
};