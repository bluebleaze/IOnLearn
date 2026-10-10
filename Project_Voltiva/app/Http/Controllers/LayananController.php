<?php

namespace App\Http\Controllers;

use App\Models\Layanan;
use Illuminate\Http\Request;

class LayananController extends Controller
{
    /**
     * Menampilkan katalog layanan servis & upgrade
     */
    public function index(Request $request)
    {
        $kategoriDipilih = $request->query('kategori', 'Semua');
        $search = $request->query('q');

        $query = Layanan::where('is_aktif', 'true');

        if ($kategoriDipilih && $kategoriDipilih !== 'Semua') {
            $query->where('kategori_layanan', $kategoriDipilih);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_layanan', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('kategori_layanan', 'like', "%{$search}%");
            });
        }

        $layananList = $query->orderBy('biaya_mulai_dari', 'asc')->get();

        $kategoriList = ['Semua', 'Maintenance', 'Upgrade', 'Hardware', 'Software', 'Diagnosa'];

        // Hitung jumlah layanan per kategori untuk badge filter
        $jumlahPerKategori = [];
        foreach ($kategoriList as $kat) {
            if ($kat === 'Semua') {
                $jumlahPerKategori[$kat] = Layanan::where('is_aktif', 'true')->count();
            } else {
                $jumlahPerKategori[$kat] = Layanan::where('is_aktif', 'true')->where('kategori_layanan', $kat)->count();
            }
        }

        return view('layanan.index', compact('layananList', 'kategoriList', 'kategoriDipilih', 'search', 'jumlahPerKategori'));
    }

    /**
     * Menampilkan detail layanan tertentu
     */
    public function show($slug)
    {
        $layanan = Layanan::where('slug', $slug)
            ->where('is_aktif', 'true')
            ->firstOrFail();

        $layananTerkait = Layanan::where('is_aktif', 'true')
            ->where('id', '!=', $layanan->id)
            ->where('kategori_layanan', $layanan->kategori_layanan)
            ->take(3)
            ->get();

        return view('layanan.show', compact('layanan', 'layananTerkait'));
    }
}
