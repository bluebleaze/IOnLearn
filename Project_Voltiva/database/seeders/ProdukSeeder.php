<?php

namespace Database\Seeders;

use App\Models\Produk;
use Illuminate\Database\Seeder;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Produk::create([
        'kategori_id'      => '1',
        'brand_id'         => '1',
        'nama_produk'      => 'Laptop ROG Zephyrus G14',
        'deskripsi_produk' => 'ASUS ROG Zephyrus G14 adalah laptop gaming ultraportabel 14 inci yang menggabungkan performa kencang khas lini Republic of Gamers dengan desain minimalis, ringkas, dan elegan.',
        'harga'            => '30000000',
        'stok'             => '10',
        'gambar'           => 'default/produk.png',
        'is_aktif'         => 'true',
        ]);
    }
}
