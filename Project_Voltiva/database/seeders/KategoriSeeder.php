<?php

namespace Database\Seeders;

use App\Models\Kategori;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Kategori::create([
            'nama_kategori'      => 'Laptop',
            'deskripsi_kategori' => 'Laptop adalah komputer pribadi yang dirancang secara terpadu dalam bentuk yang ringkas, portabel, dan lipat. Istilah ini berasal dari kata "lap" (pangkuan) dan "top" (atas), yang merujuk pada fleksibilitas penggunaannya di atas pangkuan pengguna tanpa memerlukan meja khusus.',
            'gambar'             => 'default/kategori.png',
        ]);
    }
}