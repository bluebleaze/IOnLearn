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
        Schema::create('tb_produk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('tb_kategori')->onDelete('cascade');
            $table->foreignId('brand_id')->constrained('tb_brand')->onDelete('cascade');
            $table->string('nama_produk');
            $table->text('deskripsi_produk');
            $table->bigInteger('harga');
            $table->integer('stok')->default(0);
            $table->string('gambar')->nullable();
            $table->enum('is_aktif', ['true', 'false'])->default('true');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_produk');
    }
};