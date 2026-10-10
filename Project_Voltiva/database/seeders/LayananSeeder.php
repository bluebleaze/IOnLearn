<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Layanan;

class LayananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $daftarLayanan = [
            [
                'nama_layanan'     => 'Deep Cleaning & Thermal Repaste',
                'slug'             => 'deep-cleaning-thermal-repaste',
                'kategori_layanan' => 'Maintenance',
                'deskripsi'        => 'Pembersihan total debu heatsink, kipas pendingin (fan), dan penggantian pasta termal grade gaming (Noctua/Arctic MX-4) untuk mengatasi laptop panas dan throttling.',
                'estimasi_waktu'   => '1 - 2 Jam',
                'garansi'          => '1 Bulan',
                'biaya_mulai_dari' => 75000,
                'icon'             => 'fan',
                'keuntungan'       => "Suhu laptop turun drastis (hingga 10-20°C)\nKipas tidak lagi bising dan putaran lancar\nPerforma gaming & rendering kembali maksimal\nPasta termal premium tahan lama",
                'is_aktif'         => 'true',
            ],
            [
                'nama_layanan'     => 'Upgrade SSD NVMe & RAM DDR4/DDR5',
                'slug'             => 'upgrade-ssd-ram',
                'kategori_layanan' => 'Upgrade',
                'deskripsi'        => 'Optimalkan kecepatan multitasking dan kapasitas penyimpanan laptop Anda. Menyediakan opsi SSD NVMe PCIe Gen 3/Gen 4 dan RAM Kingston / Corsair berkecepatan tinggi.',
                'estimasi_waktu'   => '1 - 3 Jam',
                'garansi'          => 'Garansi Toko 3 Bulan + Garansi Resmi 3-5 Tahun',
                'biaya_mulai_dari' => 100000,
                'icon'             => 'cpu',
                'keuntungan'       => "Booting Windows super cepat di bawah 10 detik\nBuka aplikasi berat & browser banyak tab tanpa lag\nGratis migrasi (cloning) data OS lama tanpa format\nKompatibilitas hardware dicek langsung teknisi",
                'is_aktif'         => 'true',
            ],
            [
                'nama_layanan'     => 'Instal Ulang OS & Optimasi Software',
                'slug'             => 'instal-ulang-os-optimasi',
                'kategori_layanan' => 'Software',
                'deskripsi'        => 'Instalasi bersih (fresh install) sistem operasi Windows 11 / 10 atau distro Linux, update driver hardware resmi terbaru, serta optimasi registry dan startup laptop.',
                'estimasi_waktu'   => '2 - 3 Jam',
                'garansi'          => '1 Bulan',
                'biaya_mulai_dari' => 85000,
                'icon'             => 'laptop',
                'keuntungan'       => "Sistem bersih bebas malware & bloatware\nDriver grafis & chipset terupdate ke versi stabil\nSoftware produktivitas esensial siap pakai\nBackup data personal sebelum instalasi",
                'is_aktif'         => 'true',
            ],
            [
                'nama_layanan'     => 'Penggantian Layar LCD Laptop',
                'slug'             => 'penggantian-layar-lcd',
                'kategori_layanan' => 'Hardware',
                'deskripsi'        => 'Solusi layar retak, bergaris, blank putih, atau dead pixel. Kami menyediakan penggantian panel LCD original berbagai tipe mulai dari HD, Full HD IPS, hingga refresh rate tinggi 144Hz.',
                'estimasi_waktu'   => '1 - 2 Hari Kerja',
                'garansi'          => '3 Bulan',
                'biaya_mulai_dari' => 250000,
                'icon'             => 'monitor',
                'keuntungan'       => "Panel LCD original grade A+ tanpa dead pixel\nWarna akurat dan viewing angle luas\nPemasangan rapi dan presisi tanpa merusak bezel\nPengecekan fleksibel layar menyeluruh",
                'is_aktif'         => 'true',
            ],
            [
                'nama_layanan'     => 'Servis Keyboard & Rekonstruksi Engsel',
                'slug'             => 'servis-keyboard-engsel',
                'kategori_layanan' => 'Hardware',
                'deskripsi'        => 'Perbaikan engsel laptop yang patah/macet serta penggantian modul keyboard laptop yang error, tombol lepas, atau tidak merespons akibat tumpahan cairan.',
                'estimasi_waktu'   => '1 - 2 Hari Kerja',
                'garansi'          => '2 Bulan',
                'biaya_mulai_dari' => 150000,
                'icon'             => 'wrench',
                'keuntungan'       => "Rekonstruksi dudukan baut engsel kokoh dan awet\nMencegah casing layar patah permanen\nKeyboard baru dengan feel ketikan responsif\nTersedia tipe keyboard RGB & backlit",
                'is_aktif'         => 'true',
            ],
            [
                'nama_layanan'     => 'General Checkup & Diagnosa Gratis',
                'slug'             => 'general-checkup-diagnosa',
                'kategori_layanan' => 'Diagnosa',
                'deskripsi'        => 'Layanan pemeriksaan kesehatan komponen laptop secara gratis. Kami mengecek status kesehatan SSD/HDD, baterai, sensor temperatur, dan stabilitas tegangan listrik.',
                'estimasi_waktu'   => '30 - 45 Menit',
                'garansi'          => 'Bebas Biaya Tanpa Syarat',
                'biaya_mulai_dari' => 0,
                'icon'             => 'activity',
                'keuntungan'       => "Pengecekan 100% GRATIS tanpa biaya tersembunyi\nLaporan kondisi battery health & smart disk\nKonsultasi rekomendasi upgrade sesuai budget\nEstimasi biaya transparan sebelum pengerjaan",
                'is_aktif'         => 'true',
            ],
        ];

        foreach ($daftarLayanan as $item) {
            Layanan::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }
    }
}
