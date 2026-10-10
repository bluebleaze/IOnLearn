<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Http\Request;

class KatalogController extends Controller
{
    // Menampilkan daftar seluruh produk dengan pencarian dan filter
    public function index(Request $request)
    {
        $kategori = Kategori::all();
        $brand    = Brand::all();

        // Query dasar: pastikan HANYA mengambil produk yang AKTIF
        $query = Produk::where('is_aktif', true)
                ->with(['kategori', 'brand']);

        // Filter berdasarkan pencarian nama atau brand
        if ($request->filled('q')) {
            $keyword = trim($request->q);
            $query->where(function ($q) use ($keyword) {
                $q->where('nama_produk', 'like', "%{$keyword}%")
                ->orWhereHas('brand', function ($b) use ($keyword) {
                    $b->where('nama_brand', 'like', "%{$keyword}%");
                });
            });
        }
        // Filter berdasarkan kategori tertentu
        if ($request->filled('kategori')) {
            $query->where('kategori_id', $request->kategori);
        }

        // Ambil data dengan paginasi (12 produk per halaman)
        $produk = $query->latest()->paginate(12)->withQueryString();

        return view('katalog.index', compact('produk', 'kategori', 'brand'));
    }

    // Menampilkan halaman detail dari satu produk
    public function show(Produk $produk)
    {
        // Proteksi: Jika produk diakses via URL langsung tetapi statusnya nonaktif, lempar 404
        if (!$produk->is_aktif) {
            abort(404);
        }

        $produk->load(['kategori', 'brand']);

        // Rekomendasi produk terkait (kategori sama, masih aktif, dan bukan produk yang sedang dilihat)
        $produkTerkait = Produk::where('is_aktif', true)
            ->where('kategori_id', $produk->kategori_id)
            ->where('id', '!=', $produk->id)
            ->latest()
            ->take(4)
            ->get();

        return view('katalog.show', compact('produk', 'produkTerkait'));
    }
}