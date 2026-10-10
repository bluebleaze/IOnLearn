<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $table = 'tb_brand';
    
    protected $fillable = [
        'nama_brand',
        'slug',
    ];

    //   Relasi One to Many ke tabel tb_produk
    //   1 Brand memiliki banyak Produk
    
    public function produk()
    {
        return $this->hasMany(Produk::class, 'brand_id');
    }
}