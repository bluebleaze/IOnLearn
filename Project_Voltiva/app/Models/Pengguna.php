<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Pengguna extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'tb_pengguna';

    protected $fillable = [
        'nama_lengkap',
        'email',
        'sandi',
        'nomor_telepon',
        'alamat',
        'peran',
    ];

    protected $hidden = [
        'sandi',
        'remember_token',
    ];

    // Memberitahu Laravel bahwa kolom password pada tabel menggunakan nama 'sandi'.
    public function getAuthPassword()
    {
        return $this->sandi;
    }

    // Memeriksa apakah pengguna memiliki peran sebagai admin.
    public function isAdmin(): bool
    {
    return $this->peran === 'admin';
    }

    // Relasi Pengguna bisa memiliki banyak isi keranjang
    public function keranjang()
    {
        return $this->hasMany(Keranjang::class, 'pengguna_id');
    }

    // Relasi Pengguna bisa memiliki banyak pesanan
    public function pesanan()
    {
        return $this->hasMany(Pesanan::class, 'pengguna_id');
    }

    // Relasi Pengguna bisa mengirimkan banyak saran
    public function saran()
    {
        return $this->hasMany(Saran::class, 'pengguna_id');
    }
}