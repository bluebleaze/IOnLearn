<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'tb_produk';

    protected $fillable = [
        'kategori_id',
        'brand_id',
        'nama_produk',
        'deskripsi_produk',
        'harga',
        'stok',
        'gambar',
        'is_aktif',
    ];

    protected $casts = [
        'harga'    => 'integer',
        'stok'     => 'integer',
    ];

    // Relasi Produk milik satu Kategori
    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    // Relasi Produk milik satu Brand (tabel tb_brand)
    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    // Relasi Produk bisa ada di banyak keranjang belanja
    public function keranjang()
    {
        return $this->hasMany(Keranjang::class, 'produk_id');
    }

    // Relasi Produk bisa tercatat di banyak detail pesanan
    public function detailPesanan()
    {
        return $this->hasMany(DetailPesanan::class, 'produk_id');
    }
}                                                       