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
        Schema::create('tb_saran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengguna_id')->constrained('tb_pengguna')->onDelete('cascade');
            $table->text('pesan');
            $table->boolean('is_dibaca')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_saran');
    }
};