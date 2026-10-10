<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LayananController extends Controller
{
    /**
     * Menampilkan daftar layanan untuk dikelola oleh admin
     */
    public function index()
    {
        $layanan = Layanan::latest()->paginate(10);

        return view('admin.layanan.index', compact('layanan'));
    }

    /**
     * Form tambah layanan baru
     */
    public function create()
    {
        $kategoriList = ['Maintenance', 'Upgrade', 'Hardware', 'Software', 'Diagnosa'];

        return view('admin.layanan.create', compact('kategoriList'));
    }

    /**
     * Simpan layanan baru ke database
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_layanan'     => 'required|string|max:150|unique:tb_layanan,nama_layanan',
            'kategori_layanan' => 'required|string|max:50',
            'deskripsi'        => 'required|string',
            'estimasi_waktu'   => 'required|string|max:50',
            'garansi'          => 'required|string|max:50',
            'biaya_mulai_dari' => 'required|numeric|min:0',
            'icon'             => 'nullable|string|max:50',
            'keuntungan'       => 'nullable|string',
            'is_aktif'         => 'required|in:true,false',
        ]);

        Layanan::create([
            'nama_layanan'     => $request->nama_layanan,
            'slug'             => Str::slug($request->nama_layanan),
            'kategori_layanan' => $request->kategori_layanan,
            'deskripsi'        => $request->deskripsi,
            'estimasi_waktu'   => $request->estimasi_waktu,
            'garansi'          => $request->garansi,
            'biaya_mulai_dari' => $request->biaya_mulai_dari,
            'icon'             => $request->icon ?: 'wrench',
            'keuntungan'       => $request->keuntungan,
            'is_aktif'         => $request->is_aktif,
        ]);

        return redirect()->route('admin.layanan.index')
            ->with('success', 'Layanan berhasil ditambahkan.');
    }

    /**
     * Form edit layanan
     */
    public function edit(Layanan $layanan)
    {
        $kategoriList = ['Maintenance', 'Upgrade', 'Hardware', 'Software', 'Diagnosa'];

        return view('admin.layanan.edit', compact('layanan', 'kategoriList'));
    }

    /**
     * Perbarui data layanan
     */
    public function update(Request $request, Layanan $layanan)
    {
        $request->validate([
            'nama_layanan'     => 'required|string|max:150|unique:tb_layanan,nama_layanan,' . $layanan->id,
            'kategori_layanan' => 'required|string|max:50',
            'deskripsi'        => 'required|string',
            'estimasi_waktu'   => 'required|string|max:50',
            'garansi'          => 'required|string|max:50',
            'biaya_mulai_dari' => 'required|numeric|min:0',
            'icon'             => 'nullable|string|max:50',
            'keuntungan'       => 'nullable|string',
            'is_aktif'         => 'required|in:true,false',
        ]);

        $layanan->update([
            'nama_layanan'     => $request->nama_layanan,
            'slug'             => Str::slug($request->nama_layanan),
            'kategori_layanan' => $request->kategori_layanan,
            'deskripsi'        => $request->deskripsi,
            'estimasi_waktu'   => $request->estimasi_waktu,
            'garansi'          => $request->garansi,
            'biaya_mulai_dari' => $request->biaya_mulai_dari,
            'icon'             => $request->icon ?: 'wrench',
            'keuntungan'       => $request->keuntungan,
            'is_aktif'         => $request->is_aktif,
        ]);

        return redirect()->route('admin.layanan.index')
            ->with('success', 'Layanan berhasil diperbarui.');
    }

    /**
     * Hapus data layanan
     */
    public function destroy(Layanan $layanan)
    {
        $layanan->delete();

        return redirect()->route('admin.layanan.index')
            ->with('success', 'Layanan berhasil dihapus.');
    }
}
