<?php

namespace Database\Seeders;

use App\Models\DetailPesanan;
use Illuminate\Database\Seeder;

class DetailPesananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DetailPesanan::create([
        'pesanan_id'   => '1',
        'produk_id'    => '1',
        'nama_produk'  => 'Laptop ROG Zephyrus G14',
        'harga_satuan' => '30000000',
        'jumlah'       => '1',
        'subtotal'     => '30000000',
        ]);
    }
}
