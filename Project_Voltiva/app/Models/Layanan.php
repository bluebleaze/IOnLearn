<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Layanan extends Model
{
    use HasFactory;

    protected $table = 'tb_layanan';

    protected $fillable = [
        'nama_layanan',
        'slug',
        'kategori_layanan',
        'deskripsi',
        'estimasi_waktu',
        'garansi',
        'biaya_mulai_dari',
        'icon',
        'keuntungan',
        'is_aktif',
    ];

    protected $casts = [
        'biaya_mulai_dari' => 'integer',
    ];

    /**
     * Helper untuk mengambil array keuntungan (dipisah newline)
     */
    public function getDaftarKeuntunganAttribute(): array
    {
        if (empty($this->keuntungan)) {
            return [];
        }

        return array_filter(array_map('trim', explode("\n", $this->keuntungan)));
    }
}
