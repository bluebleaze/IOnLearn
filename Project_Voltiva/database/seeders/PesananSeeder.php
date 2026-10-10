<?php

namespace Database\Seeders;

use App\Models\Pesanan;
use Illuminate\Database\Seeder;

class PesananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Pesanan::create([
            'pengguna_id'       => '1',
            'total_harga'       => '30000000',
            'alamat_pengiriman' => 'Jl. Pangeran Suriansyah No. 5',
            'status_pembayaran' => 'pending',
            'status_pengiriman' => 'dipersiapkan'
        ]);
    }
}
