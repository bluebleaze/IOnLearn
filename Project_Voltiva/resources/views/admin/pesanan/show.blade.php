@extends('layouts.admin')

@section('title', 'Detail Pesanan #ORD-' . str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) . ' - Voltiva Admin')
@section('header_title', 'Detail & Update Pesanan')

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    
    <!-- Top Action -->
    <div class="flex items-center justify-between">
        <a href="{{ route('admin.pesanan.index') }}" class="btn-volt-secondary text-xs">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Daftar Pesanan</span>
        </a>
        <span class="text-xs text-slate-500">ID: #ORD-{{ str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) }}</span>
    </div>

    <!-- Status Updater Form Card -->
    <div class="card-volt p-6 bg-white">
        <h2 class="text-base font-bold text-slate-900 mb-4">Perbarui Status Transaksi</h2>
        
        <form action="{{ route('admin.pesanan.updateStatus', $pesanan->id) }}" method="POST" class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            @csrf
            @method('PUT')

            <!-- Status Pembayaran -->
            <div class="sm:col-span-5">
                <label for="status_pembayaran" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Status Pembayaran
                </label>
                <select id="status_pembayaran" name="status_pembayaran" required
                    class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @foreach(['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'] as $st)
                        <option value="{{ $st }}" {{ $pesanan->status_pembayaran === $st ? 'selected' : '' }}>
                            {{ ucfirst($st) }}
                        </option>
                    @endforeach
                </select>
            </div>

            <!-- Status Pengiriman -->
            <div class="sm:col-span-5">
                <label for="status_pengiriman" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Status Pengiriman
                </label>
                <select id="status_pengiriman" name="status_pengiriman" required
                    class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @foreach(['dipersiapkan', 'dikirim', 'selesai', 'dibatalkan'] as $sp)
                        <option value="{{ $sp }}" {{ $pesanan->status_pengiriman === $sp ? 'selected' : '' }}>
                            {{ ucfirst($sp) }}
                        </option>
                    @endforeach
                </select>
            </div>

            <!-- Submit -->
            <div class="sm:col-span-2">
                <button type="submit" class="btn-volt w-full py-2.5 text-xs">
                    <i data-lucide="check" class="w-4 h-4"></i>
                    <span>Simpan</span>
                </button>
            </div>
        </form>
    </div>

    <!-- Invoice Details Card -->
    <div class="card-volt p-6 sm:p-8 bg-white">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
                <span class="text-xs uppercase font-semibold text-slate-400">Faktur Transaksi</span>
                <h1 class="text-2xl font-extrabold text-slate-900 mt-1">
                    Invoice #ORD-{{ str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) }}
                </h1>
                <p class="text-xs text-slate-500 mt-1">Tanggal: {{ $pesanan->created_at->format('d F Y, H:i') }} WIB</p>
            </div>
            <div>
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    {{ $pesanan->status_pembayaran }} / {{ $pesanan->status_pengiriman }}
                </span>
            </div>
        </div>

        <!-- Buyer & Shipping Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
            <div>
                <span class="font-bold text-slate-800 uppercase tracking-wider block mb-2">Informasi Pembeli</span>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <p class="font-bold text-slate-900 text-sm">{{ $pesanan->pengguna->nama_lengkap ?? 'User Tidak Diketahui' }}</p>
                    <p class="text-slate-500">{{ $pesanan->pengguna->email ?? '-' }}</p>
                    <p class="text-slate-500">{{ $pesanan->pengguna->nomor_telepon ?? 'Nomor telepon tidak diisi' }}</p>
                </div>
            </div>

            <div>
                <span class="font-bold text-slate-800 uppercase tracking-wider block mb-2">Alamat Pengiriman</span>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p class="text-slate-700 leading-relaxed">{{ $pesanan->alamat_pengiriman }}</p>
                </div>
            </div>
        </div>

        <!-- Ordered Items -->
        <div class="py-6 border-b border-slate-100">
            <span class="font-bold text-slate-800 uppercase tracking-wider text-xs block mb-4">Rincian Item Produk</span>
            <div class="divide-y divide-slate-100">
                @foreach($pesanan->detailPesanan as $item)
                    <div class="py-3 flex items-center justify-between text-xs sm:text-sm">
                        <div>
                            <p class="font-bold text-slate-900">{{ $item->nama_produk }}</p>
                            <p class="text-xs text-slate-500 mt-0.5">
                                {{ $item->jumlah }} unit x Rp {{ number_format($item->harga_satuan, 0, ',', '.') }}
                            </p>
                        </div>
                        <span class="font-bold text-slate-900">
                            Rp {{ number_format($item->subtotal, 0, ',', '.') }}
                        </span>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Grand Total -->
        <div class="pt-6 flex justify-end">
            <div class="text-right">
                <span class="text-xs text-slate-500 block">Total Pembayaran:</span>
                <span class="text-2xl font-extrabold text-blue-600">
                    Rp {{ number_format($pesanan->total_harga, 0, ',', '.') }}
                </span>
            </div>
        </div>
    </div>

</div>
@endsection
