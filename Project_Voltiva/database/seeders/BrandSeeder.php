<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Brand::create([
            'nama_brand' => 'Asus',
            'slug'       => 'asus',
        ]);
        Brand::create([
            'nama_brand' => 'Oppo',
            'slug'       => 'oppo',
        ]);
    }
}
