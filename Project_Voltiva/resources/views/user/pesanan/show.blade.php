@extends('layouts.main')

@section('title', 'Detail Pesanan #ORD-' . str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) . ' - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <a href="{{ route('pesanan.index') }}" class="hover:text-blue-600 transition-colors">Pesanan</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium">#ORD-{{ str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) }}</span>
        </nav>

        <div class="card-volt p-6 sm:p-8 bg-white shadow-xl shadow-slate-200/50 mb-8">
            <!-- Header Invoice -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                    <span class="text-xs uppercase font-semibold text-slate-400">Rincian Transaksi</span>
                    <h1 class="text-2xl font-extrabold text-slate-900 mt-1">
                        Invoice #ORD-{{ str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) }}
                    </h1>
                    <p class="text-xs text-slate-500 mt-1">Dipesan pada {{ $pesanan->created_at->format('d F Y, H:i') }} WIB</p>
                </div>

                <div class="flex flex-col sm:items-end gap-1.5">
                    <span class="text-xs text-slate-400 font-medium">Status Pembayaran:</span>
                    @if($pesanan->status_pembayaran === 'selesai')
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Lunas
                        </span>
                    @elseif($pesanan->status_pembayaran === 'dibatalkan')
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            Dibatalkan
                        </span>
                    @else
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            {{ ucfirst($pesanan->status_pembayaran) }}
                        </span>
                    @endif
                </div>
            </div>

            <!-- Address and Delivery Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
                <div>
                    <span class="font-bold text-slate-800 uppercase tracking-wider block mb-2">Tujuan Pengiriman</span>
                    <p class="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {{ $pesanan->alamat_pengiriman }}
                    </p>
                </div>
                <div>
                    <span class="font-bold text-slate-800 uppercase tracking-wider block mb-2">Informasi Ekspedisi</span>
                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Status Pengiriman:</span>
                            <span class="font-bold text-slate-800 capitalize">{{ $pesanan->status_pengiriman }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Metode Pengiriman:</span>
                            <span class="font-bold text-slate-800">Voltiva Express (Gratis)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="py-6 border-b border-slate-100">
                <span class="font-bold text-slate-800 uppercase tracking-wider text-xs block mb-4">Daftar Produk yang Dipesan</span>
                <div class="divide-y divide-slate-100">
                    @foreach($pesanan->detailPesanan as $item)
                        <div class="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                            <div class="flex-1 pr-4">
                                <p class="font-bold text-slate-900">{{ $item->nama_produk }}</p>
                                <p class="text-slate-500 text-xs mt-0.5">
                                    {{ $item->jumlah }} x Rp {{ number_format($item->harga_satuan, 0, ',', '.') }}
                                </p>
                            </div>
                            <span class="font-bold text-slate-900 shrink-0">
                                Rp {{ number_format($item->subtotal, 0, ',', '.') }}
                            </span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Grand Total -->
            <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                @if($pesanan->status_pembayaran === 'pending')
                    <form action="{{ route('pesanan.batalkan', $pesanan->id) }}" method="POST" onsubmit="return confirm('Yakin ingin membatalkan pesanan ini?');">
                        @csrf
                        <button type="submit" class="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200">
                            Batalkan Pesanan Ini
                        </button>
                    </form>
                @else
                    <div></div>
                @endif

                <div class="text-right">
                    <span class="text-xs text-slate-500 block">Total Akhir Tagihan:</span>
                    <span class="text-2xl font-extrabold text-blue-600">
                        Rp {{ number_format($pesanan->total_harga, 0, ',', '.') }}
                    </span>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
