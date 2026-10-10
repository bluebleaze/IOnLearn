<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPesanan extends Model
{
    use HasFactory;

    protected $table = 'tb_detail_pesanan';

    protected $fillable = [
        'pesanan_id',
        'produk_id',
        'nama_produk',
        'harga_satuan',
        'jumlah',
        'subtotal',
    ];

    // Mengonversi tipe data secara otomatis
    protected $casts = [
        'harga_satuan' => 'integer',
        'jumlah'       => 'integer',
        'subtotal'     => 'integer',
    ];
    
    // Relasi Detail pesanan merujuk ke Produk asli (bisa null jika produk dihapus)
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
    // Relasi ke tabel tb_pesanan
    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }
}