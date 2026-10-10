<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil seeder lain yang Anda miliki di sini. Contoh:
        $this->call([
            PenggunaSeeder::class,
            KategoriSeeder::class,
            BrandSeeder::class,
            ProdukSeeder::class,
            PesananSeeder::class,
            DetailPesananSeeder::class,
            LayananSeeder::class,
        ]);
    }
}