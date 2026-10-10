<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keranjang extends Model
{
    use HasFactory;

    protected $table = 'tb_keranjang';

    protected $fillable = [
        'pengguna_id',
        'produk_id',
        'jumlah',
    ];

    // Mengonversi tipe data otomatis
    protected $casts = [
        'jumlah' => 'integer',
    ];
    // Relasi Item keranjang milik seorang Pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    // Relasi Item keranjang mengacu pada sebuah Produk
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}