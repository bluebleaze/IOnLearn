<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    use HasFactory;

    protected $table = 'tb_pesanan';

    protected $fillable = [
        'pengguna_id',
        'total_harga',
        'alamat_pengiriman',
        'status_pembayaran',
        'status_pengiriman',
    ];

    protected $casts = [
        'total_harga' => 'integer',
    ];

    // Relasi Pesanan dibuat oleh seorang Pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    // Relasi Pesanan memiliki banyak rincian/detail barang
    public function detailPesanan()
    {
        return $this->hasMany(DetailPesanan::class, 'pesanan_id');
    }
}