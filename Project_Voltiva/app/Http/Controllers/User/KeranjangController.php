<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Keranjang;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KeranjangController extends Controller
{
    // Menampilkan daftar item di keranjang pengguna
    public function index()
    {
        $keranjang = Keranjang::with('produk')
            ->where('pengguna_id', Auth::id())
            ->get();

        // Hitung total harga keseluruhan di keranjang (Hanya produk yang ada & aktif)
        $totalHarga = $keranjang->sum(function ($item) {
            if ($item->produk && $item->produk->is_aktif) {
                return $item->produk->harga * $item->jumlah;
            }
            return 0;
        });

        return view('user.keranjang.index', compact('keranjang', 'totalHarga'));
    }

    // Menambah produk ke keranjang
    public function store(Request $request)
    {
        $request->validate([
            'produk_id' => 'required|exists:tb_produk,id',
            'jumlah'    => 'required|integer|min:1',
        ]);

        $produk = Produk::findOrFail($request->produk_id);

        // Validasi status keaktifan produk
        if (!$produk->is_aktif) {
            return redirect()->back()->with('error', 'Produk ini sedang tidak tersedia.');
        }

        // Validasi ketersediaan stok
        if ($produk->stok < $request->jumlah) {
            return redirect()->back()->with('error', 'Stok produk tidak mencukupi.');
        }

        // Cek apakah produk sudah ada di keranjang pengguna
        $itemKeranjang = Keranjang::where('pengguna_id', Auth::id())
            ->where('produk_id', $request->produk_id)
            ->first();

        if ($itemKeranjang) {
            // Jika sudah ada, tambahkan jumlahnya
            $jumlahBaru = $itemKeranjang->jumlah + $request->jumlah;

            if ($produk->stok < $jumlahBaru) {
                return redirect()->back()->with('error', 'Jumlah total di keranjang melebihi stok yang tersedia.');
            }

            $itemKeranjang->update(['jumlah' => $jumlahBaru]);
        } else {
            // Jika belum ada, buat record baru
            Keranjang::create([
                'pengguna_id' => Auth::id(),
                'produk_id'   => $request->produk_id,
                'jumlah'      => $request->jumlah,
            ]);
        }

        return redirect()->route('keranjang.index')->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    // Memperbarui jumlah item di keranjang
    public function update(Request $request, Keranjang $keranjang)
    {
        // Otorisasi kepemilikan item keranjang
        if ($keranjang->pengguna_id !== Auth::id()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $keranjang->load('produk');

        // Validasi jika produk sudah terhapus atau non-aktif
        if (!$keranjang->produk || !$keranjang->produk->is_aktif) {
            return redirect()->back()->with('error', 'Produk ini sudah tidak tersedia.');
        }

        // Validasi terhadap stok produk yang tersedia
        if ($keranjang->produk->stok < $request->jumlah) {
            return redirect()->back()->with('error', 'Jumlah melebihi stok yang tersedia.');
        }

        $keranjang->update([
            'jumlah' => $request->jumlah,
        ]);

        return redirect()->back()->with('success', 'Jumlah barang berhasil diperbarui.');
    }

    // Menghapus item dari keranjang
    public function destroy(Keranjang $keranjang)
    {
        // Otorisasi kepemilikan item keranjang
        if ($keranjang->pengguna_id !== Auth::id()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $keranjang->delete();

        return redirect()->back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }
}