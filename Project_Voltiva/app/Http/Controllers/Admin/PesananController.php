<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PesananController extends Controller
{
    // Menampilkan seluruh daftar pesanan masuk dari semua pembeli
    public function index()
    {
        $pesanan = Pesanan::with('pengguna')
            ->latest()
            ->paginate(15);

        return view('admin.pesanan.index', compact('pesanan'));
    }

    // Menampilkan rincian detail pesanan pembeli
    public function show(Pesanan $pesanan)
    {
        $pesanan->load(['pengguna', 'detailPesanan.produk']);

        return view('admin.pesanan.show', compact('pesanan'));
    }

    // Perbarui status pesanan (misal: pending, diproses, dikirim, selesai, dibatalkan)
    public function updateStatus(Request $request, Pesanan $pesanan)
    {
        $request->validate([
            'status_pembayaran' => 'required|in:pending,diproses,dikirim,selesai,dibatalkan',
            'status_pengiriman' => 'required|in:dipersiapkan,dikirim,selesai,dibatalkan'
        ], [
            'status.required' => 'Status pesanan wajib dipilih.',
            'status.in'       => 'Pilihan status tidak valid.',
            'status_pengiriman.required' => 'Status pengiriman wajib dipilih.',
            'status_pengiriman.in'       => 'Pilihan status pengiriman tidak valid.',
        ]);

        // Cegah perubahan status jika transaksi sudah final
        if (in_array($pesanan->status_pengiriman, ['selesai', 'dibatalkan'])) {
            return redirect()->back()->with('error', 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah lagi.');
        }

        try {
            DB::transaction(function () use ($request, $pesanan) {
                // Jika status pembayaran atau pengiriman diubah ke 'dibatalkan', kembalikan stok
                if ($request->status_pembayaran === 'dibatalkan' || $request->status_pengiriman === 'dibatalkan') {
                    if ($pesanan->status_pembayaran !== 'dibatalkan' && $pesanan->status_pengiriman !== 'dibatalkan') {
                        $pesanan->load('detailPesanan.produk');

                        foreach ($pesanan->detailPesanan as $detail) {
                            if ($detail->produk) {
                                $detail->produk->increment('stok', $detail->jumlah);
                            }
                        }
                    }
                }

                // Perbarui status pesanan
                $pesanan->update([
                    'status_pembayaran' => $request->status_pembayaran,
                    'status_pengiriman' => $request->status_pengiriman,
                ]);
            });

            return redirect()->back()->with('success', 'Status pesanan berhasil diperbarui.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui status: ' . $e->getMessage());
        }
    }
}