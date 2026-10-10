<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProdukController extends Controller
{
    // Tampil seluruh daftar produk admin
    public function index()
    {
        $produk = Produk::with(['kategori', 'brand'])->latest()->paginate(10);
        return view('admin.produk.index', compact('produk'));
    }

    // Form tambah produk
    public function create()
    {
        $kategori = Kategori::all();
        $brand = Brand::all();
        return view('admin.produk.create', compact('kategori', 'brand'));
    }

    // Simpan produk baru ke database
    public function store(Request $request)
    {
        $request->validate([
            'kategori_id'      => 'required|exists:tb_kategori,id',
            'brand_id'         => 'required|exists:tb_brand,id',
            'nama_produk'      => 'required|string|max:255',
            'deskripsi_produk' => 'required|string',
            'harga'            => 'required|numeric|min:0',
            'stok'             => 'required|integer|min:0',
            'gambar'           => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Upload gambar ke folder storage/app/public/produk
        $pathGambar = $request->file('gambar')->store('produk', 'public');

        Produk::create([
            'kategori_id'      => $request->kategori_id,
            'brand_id'         => $request->brand_id,
            'nama_produk'      => $request->nama_produk,
            'deskripsi_produk' => $request->deskripsi_produk,
            'harga'            => $request->harga,
            'stok'             => $request->stok,
            'gambar'           => $pathGambar,
            'is_aktif'         => true,
        ]);

        return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    // Form edit produk
    public function edit(Produk $produk)
    {
        $kategori = Kategori::all();
        $brand = Brand::all();
        return view('admin.produk.edit', compact('produk', 'kategori', 'brand'));
    }

    // Perbarui data produk
    public function update(Request $request, Produk $produk)
    {
        $request->validate([
            'kategori_id'      => 'required|exists:tb_kategori,id',
            'brand_id'         => 'required|exists:tb_brand,id',
            'nama_produk'      => 'required|string|max:255',
            'deskripsi_produk' => 'required|string',
            'harga'            => 'required|numeric|min:0',
            'stok'             => 'required|integer|min:0',
            'gambar'           => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_aktif'         => 'required|boolean',
        ]);

        $data = [
            'kategori_id'      => $request->kategori_id,
            'brand_id'         => $request->brand_id,
            'nama_produk'      => $request->nama_produk,
            'deskripsi_produk' => $request->deskripsi_produk,
            'harga'            => $request->harga,
            'stok'             => $request->stok,
            'is_aktif'         => $request->boolean('is_aktif'),
        ];

        // Jika ada gambar baru yang diunggah
        if ($request->hasFile('gambar')) {
            // Hapus gambar lama jika ada
            if ($produk->gambar && Storage::disk('public')->exists($produk->gambar)) {
                Storage::disk('public')->delete($produk->gambar);
            }
            $data['gambar'] = $request->file('gambar')->store('produk', 'public');
        }

        $produk->update($data);

        return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil diperbarui.');
    }

    // Nonaktifkan atau Hapus produk
    public function destroy(Produk $produk)
    {
        try {
            // Opsi 1: Menghapus baris secara permanen dari database
            if ($produk->gambar && Storage::disk('public')->exists($produk->gambar)) {
                Storage::disk('public')->delete($produk->gambar);
            }

            $produk->delete();

            return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil dihapus secara permanen.');

        } catch (QueryException $e) {
            // Opsi Fallback: Tangkap error jika produk terhalang Foreign Key (onDelete restrict)
            if ($e->getCode() == 23000) {
                // Nonaktifkan produk sebagai gantinya agar riwayat transaksi aman
                $produk->update(['is_aktif' => false]);

                return redirect()->route('admin.produk.index')->with('warning', 'Produk tidak dapat dihapus permanen karena tercatat dalam histori transaksi. Status produk diubah menjadi nonaktif.');
            }

            return redirect()->route('admin.produk.index')->with('error', 'Terjadi kesalahan saat menghapus produk.');
        }
    }
}