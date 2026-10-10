<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PesananController extends Controller
{
    // Menampilkan seluruh riwayat transaksi pembeli yang sedang login
    public function index()
    {
        $pesanan = Pesanan::where('pengguna_id', Auth::id())
            ->withCount('detailPesanan')
            ->latest()
            ->paginate(10);

        return view('user.pesanan.index', compact('pesanan'));
    }

    // Menampilkan detail invoice/rincian item dari satu pesanan
    public function show(Pesanan $pesanan)
    {
        if ($pesanan->pengguna_id !== Auth::id()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $pesanan->load(['detailPesanan.produk']);

        return view('user.pesanan.show', compact('pesanan'));
    }
    // (Fitur Tambahan) Pembeli membatalkan pesanan sendiri jika belum dibayar
    public function batalkan(Pesanan $pesanan)
    {
        if ($pesanan->pengguna_id !== Auth::id()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        // Pembeli hanya boleh membatalkan jika status_pembayaran masih 'pending'
        if ($pesanan->status_pembayaran !== 'pending') {
            return redirect()->back()->with('error', 'Pesanan ini tidak dapat dibatalkan lagi.');
        }

        try {
            DB::transaction(function () use ($pesanan) {
                // Kembalikan stok produk yang dipesan
                $pesanan->load('detailPesanan.produk');
                foreach ($pesanan->detailPesanan as $detail) {
                    if ($detail->produk) {
                        $detail->produk->increment('stok', $detail->jumlah);
                    }
                }

                // Ubah status pembayaran & status pengiriman menjadi 'dibatalkan'
                $pesanan->update([
                    'status_pembayaran' => 'dibatalkan',
                    'status_pengiriman' => 'dibatalkan',
                ]);
            });

            return redirect()->back()->with('success', 'Pesanan berhasil dibatalkan.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membatalkan pesanan: ' . $e->getMessage());
        }
    }
}