<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\DetailPesanan;
use App\Models\Keranjang;
use App\Models\Pesanan;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    // Menampilkan halaman checkout (ringkasan belanja dan form alamat)
    public function index()
    {
        // Ambil keranjang beserta produk yang aktif saja
        $keranjang = Keranjang::whereHas('produk', function ($query) {
                $query->where('is_aktif', true);
            })
            ->with('produk')
            ->where('pengguna_id', Auth::id())
            ->get();

        // Jika keranjang kosong (atau semua produk di dalamnya non-aktif), kembalikan
        if ($keranjang->isEmpty()) {
            return redirect()->route('keranjang.index')->with('error', 'Keranjang belanja Anda kosong atau produk tidak lagi tersedia.');
        }

        // Hitung total harga belanjaan
        $totalHarga = $keranjang->sum(function ($item) {
            return $item->produk->harga * $item->jumlah;
        });

        $pengguna = Auth::user();

        return view('user.checkout.index', compact('keranjang', 'totalHarga', 'pengguna'));
    }

    // Memproses transaksi checkout
    public function store(Request $request)
    {
        $request->validate([
            'alamat_pengiriman'          => 'required|string|max:500',
        ], [
            'alamat_pengiriman.required' => 'Alamat pengiriman wajib diisi.',
            'alamat_pengiriman.max'      => 'Alamat pengiriman terlalu panjang (maksimal 500 karakter).',
        ]);

        $penggunaId = Auth::id();

        // Ambil semua item keranjang milik user
        $keranjang = Keranjang::with('produk')
            ->where('pengguna_id', $penggunaId)
            ->get();

        if ($keranjang->isEmpty()) {
            return redirect()->route('keranjang.index')->with('error', 'Keranjang belanja Anda kosong.');
        }

        // DB Transaction menjamin integritas data (atomicity)
        try {
            DB::transaction(function () use ($request, $penggunaId, $keranjang) {

                $totalHarga = 0;
                $produkList = [];

                // 1. Validasi keaktifan & stok akhir dengan Pessimistic Locking
                foreach ($keranjang as $item) {
                    $produk = Produk::lockForUpdate()->find($item->produk_id);

                    // Cegah jika produk sudah dihapus/tidak ada
                    if (!$produk) {
                        throw new \Exception("Salah satu produk di keranjang Anda sudah tidak ditemukan.");
                    }

                    // Cegah jika produk dinonaktifkan Admin
                    if (!$produk->is_aktif) {
                        throw new \Exception("Produk '{$produk->nama_produk}' sedang tidak tersedia/nonaktif.");
                    }

                    // Cegah jika stok kurang
                    if ($produk->stok < $item->jumlah) {
                        throw new \Exception("Stok untuk produk '{$produk->nama_produk}' tidak mencukupi.");
                    }

                    $totalHarga += $produk->harga * $item->jumlah;

                    $produkList[] = [
                        'produk' => $produk,
                        'jumlah' => $item->jumlah,
                    ];
                }

                // 2. Buat data Induk Pesanan di tb_pesanan
                $pesanan = Pesanan::create([
                    'pengguna_id'       => $penggunaId,
                    'total_harga'       => $totalHarga,
                    'alamat_pengiriman' => $request->alamat_pengiriman,
                    'status_pembayaran' => 'pending',
                    'status_pengiriman' => 'dipersiapkan',
                ]);

                // 3. Pindahkan item keranjang ke tb_detail_pesanan & Potong stok produk
                foreach ($produkList as $data) {
                    $produk = $data['produk'];
                    $jumlah = $data['jumlah'];
                    $subtotal = $produk->harga * $jumlah;

                    DetailPesanan::create([
                        'pesanan_id'   => $pesanan->id,
                        'produk_id'    => $produk->id,
                        'nama_produk'  => $produk->nama_produk,
                        'harga_satuan' => $produk->harga,
                        'jumlah'       => $jumlah,
                        'subtotal'     => $subtotal,
                    ]);

                    // Potong stok
                    $produk->decrement('stok', $jumlah);
                }

                // 4. Bersihkan keranjang belanja pengguna
                Keranjang::where('pengguna_id', $penggunaId)->delete();
            });

            return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil dibuat! Silakan lakukan pembayaran.');

        } catch (\Exception $e) {
            // Jika ada kesalahan, transaksi otomatis dibatalkan (rollback)
            return redirect()->back()->with('error', 'Gagal memproses pesanan: ' . $e->getMessage());
        }
    }
}