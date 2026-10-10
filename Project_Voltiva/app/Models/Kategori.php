<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use HasFactory;

    protected $table = 'tb_kategori';

    protected $fillable = [
        'nama_kategori',
        'deskripsi_kategori',
        'gambar',
    ];
    // Relasi Satu kategori memiliki banyak produk
    public function produk()
    {
        return $this->hasMany(Produk::class, 'kategori_id');
    }
}