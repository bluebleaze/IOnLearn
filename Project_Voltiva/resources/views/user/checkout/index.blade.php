@extends('layouts.main')

@section('title', 'Checkout Pembelian - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <a href="{{ route('keranjang.index') }}" class="hover:text-blue-600 transition-colors">Keranjang</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium">Checkout</span>
        </nav>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Konfirmasi & Checkout Pesanan</h1>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left: Shipping Address & Buyer Info Form -->
            <div class="lg:col-span-7 space-y-6">
                
                <div class="card-volt p-6 sm:p-8 bg-white">
                    <h2 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>
                        <span>Alamat Pengiriman</span>
                    </h2>

                    <form action="{{ route('checkout.store') }}" method="POST" id="checkout-form" class="space-y-4">
                        @csrf

                        <!-- User Info Preview -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div>
                                <span class="text-slate-400 font-medium block">Nama Penerima:</span>
                                <span class="font-bold text-slate-800 text-sm">{{ $pengguna->nama_lengkap }}</span>
                            </div>
                            <div>
                                <span class="text-slate-400 font-medium block">Email:</span>
                                <span class="font-bold text-slate-800 text-sm">{{ $pengguna->email }}</span>
                            </div>
                        </div>

                        <!-- Shipping Address Input -->
                        <div>
                            <label for="alamat_pengiriman" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Alamat Lengkap Pengiriman *
                            </label>
                            <textarea id="alamat_pengiriman" name="alamat_pengiriman" rows="4" required
                                placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
                                class="w-full p-3.5 text-sm bg-slate-50 border @error('alamat_pengiriman') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">{{ old('alamat_pengiriman', $pengguna->alamat) }}</textarea>
                            @error('alamat_pengiriman')
                                <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Payment Method Info -->
                        <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                            <i data-lucide="credit-card" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"></i>
                            <div class="text-xs text-blue-900 leading-relaxed">
                                <span class="font-bold block text-sm">Metode Pembayaran: Transfer Bank / QRIS</span>
                                Invoice dan nomor rekening tujuan akan diterbitkan setelah pesanan dikonfirmasi.
                            </div>
                        </div>
                    </form>
                </div>

            </div>

            <!-- Right: Order Items Summary -->
            <div class="lg:col-span-5">
                <div class="card-volt p-6 sticky top-24 bg-white">
                    <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                        Rincian Barang ({{ $keranjang->sum('jumlah') }})
                    </h2>

                    <!-- Items list -->
                    <div class="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-2 mb-6">
                        @foreach($keranjang as $item)
                            <div class="py-3 flex items-center justify-between text-xs">
                                <div class="pr-3">
                                    <p class="font-semibold text-slate-800 line-clamp-1">{{ $item->produk->nama_produk }}</p>
                                    <p class="text-slate-500 mt-0.5">{{ $item->jumlah }} x Rp {{ number_format($item->produk->harga, 0, ',', '.') }}</p>
                                </div>
                                <span class="font-bold text-slate-800 shrink-0">
                                    Rp {{ number_format($item->produk->harga * $item->jumlah, 0, ',', '.') }}
                                </span>
                            </div>
                        @endforeach
                    </div>

                    <div class="border-t border-slate-100 pt-4 space-y-2.5 text-xs mb-6">
                        <div class="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span class="font-semibold text-slate-800">Rp {{ number_format($totalHarga, 0, ',', '.') }}</span>
                        </div>
                        <div class="flex justify-between text-slate-500">
                            <span>Biaya Pengiriman</span>
                            <span class="font-semibold text-emerald-600">Gratis (Promo Voltiva)</span>
                        </div>
                        <div class="border-t border-slate-100 pt-3 flex justify-between items-baseline text-sm">
                            <span class="font-bold text-slate-900">Total Pembayaran</span>
                            <span class="text-xl font-extrabold text-blue-600">
                                Rp {{ number_format($totalHarga, 0, ',', '.') }}
                            </span>
                        </div>
                    </div>

                    <!-- Trigger form submission -->
                    <button type="submit" form="checkout-form" class="btn-volt w-full py-3.5 text-sm font-semibold">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Konfirmasi & Buat Pesanan</span>
                    </button>
                </div>
            </div>

        </div>

    </div>
</div>
@endsection
