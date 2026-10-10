<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    // 1. Tampilkan Daftar Brand
    public function index()
    {
        // withCount('produk') untuk menampilkan total barang per brand di view tanpa N+1 Query
        $brands = Brand::withCount('produk')->latest()->paginate(10);
        return view('admin.brand.index', compact('brands'));
    }

    // 2. Tampilkan Form Tambah Brand
    public function create()
    {
        return view('admin.brand.create');
    }

    // 3. Simpan Brand Baru
    public function store(Request $request)
    {
        $request->validate([
            'nama_brand' => 'required|string|max:255|unique:tb_brand,nama_brand',
        ],
        [
            'nama_brand.required' => 'Nama brand wajib diisi.',
            'nama_brand.unique'   => 'Nama brand tersebut sudah ada.',
        ]);

        Brand::create([
            'nama_brand' => trim($request->nama_brand),
            'slug'       => Str::slug($request->nama_brand),
        ]);

        return redirect()->route('admin.brand.index')
            ->with('success', 'Brand berhasil ditambahkan!');
    }

    // 4. Tampilkan Form Edit Brand
    public function edit(Brand $brand)
    {
        return view('admin.brand.edit', compact('brand'));
    }

    // 5. Perbarui Data Brand
    public function update(Request $request, Brand $brand)
    {
        $request->validate([
            'nama_brand' => 'required|string|max:255|unique:tb_brand,nama_brand,' . $brand->id,
        ],
        [
            'nama_brand.required' => 'Nama brand wajib diisi.',
            'nama_brand.unique'   => 'Nama brand tersebut sudah digunakan.',
        ]);

        $brand->update([
            'nama_brand' => trim($request->nama_brand),
            'slug'       => Str::slug($request->nama_brand),
        ]);

        return redirect()->route('admin.brand.index')
            ->with('success', 'Brand berhasil diperbarui!');
    }

    // 6. Hapus Brand
    public function destroy(Brand $brand)
    {
        // Menggunakan exists() yang jauh lebih ringan daripada count()
        if ($brand->produk()->exists()) {
            return redirect()->route('admin.brand.index')
                ->with('error', 'Brand tidak dapat dihapus karena masih memiliki produk terkait!');
        }
        
        $brand->delete();

        return redirect()->route('admin.brand.index')
            ->with('success', 'Brand berhasil dihapus!');
    }
}