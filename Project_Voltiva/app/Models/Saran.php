<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Saran extends Model
{
    use HasFactory;

    protected $table = 'tb_saran';

    protected $fillable = [
        'pengguna_id',
        'pesan',
        'is_dibaca',
    ];

    protected $casts = [
        'is_dibaca' => 'boolean',
    ];

    // Relasi ke tabel induk Pengguna (tb_pengguna), Menghubungkan data seperti Pesanan, Keranjang, Saran dengan pemiliknya berdasarkan kolom 'pengguna_id'.
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}