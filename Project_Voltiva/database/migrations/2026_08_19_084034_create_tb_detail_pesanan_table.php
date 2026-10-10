<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_detail_pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('tb_pesanan')->onDelete('cascade');
            $table->foreignId('produk_id')->constrained('tb_produk')->onDelete('restrict');
            $table->string('nama_produk'); 
            $table->bigInteger('harga_satuan');
            $table->integer('jumlah');
            $table->bigInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_detail_pesanan');
    }
};