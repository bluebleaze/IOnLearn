@extends('layouts.main')

@section('title', 'Keranjang Belanja - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium">Keranjang Belanja</span>
        </nav>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Keranjang Belanja</h1>

        @if($keranjang->count() > 0)
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <!-- Items List -->
                <div class="lg:col-span-8 space-y-4">
                    @foreach($keranjang as $item)
                        @if($item->produk)
                            <div class="card-volt p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                <!-- Thumbnail -->
                                <div class="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                                    @if($item->produk->gambar && file_exists(public_path('storage/' . $item->produk->gambar)))
                                        <img src="{{ asset('storage/' . $item->produk->gambar) }}" alt="{{ $item->produk->nama_produk }}" class="w-full h-full object-cover">
                                    @else
                                        <i data-lucide="laptop" class="w-8 h-8 text-slate-300"></i>
                                    @endif
                                </div>

                                <!-- Detail Info -->
                                <div class="flex-1 text-center sm:text-left">
                                    <h3 class="font-bold text-slate-900 text-sm sm:text-base">
                                        <a href="{{ route('katalog.show', $item->produk->id) }}" class="hover:text-blue-600">
                                            {{ $item->produk->nama_produk }}
                                        </a>
                                    </h3>
                                    <p class="text-xs text-slate-500 mt-1">
                                        Harga Satuan: <span class="font-semibold text-slate-700">Rp {{ number_format($item->produk->harga, 0, ',', '.') }}</span>
                                    </p>
                                </div>

                                <!-- Quantity Form -->
                                <div class="flex items-center gap-3">
                                    <form action="{{ route('keranjang.update', $item->id) }}" method="POST" class="flex items-center gap-2">
                                        @csrf
                                        @method('PUT')
                                        <input type="number" name="jumlah" value="{{ $item->jumlah }}" min="1" max="{{ $item->produk->stok }}"
                                            class="w-16 py-1.5 px-2 text-center text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <button type="submit" class="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100" title="Perbarui Jumlah">
                                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                                        </button>
                                    </form>

                                    <!-- Delete Item -->
                                    <form action="{{ route('keranjang.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Hapus item ini dari keranjang?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Hapus">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                </div>

                                <!-- Subtotal -->
                                <div class="text-right shrink-0 min-w-28">
                                    <span class="text-xs text-slate-400 block sm:hidden">Subtotal:</span>
                                    <span class="text-sm sm:text-base font-bold text-blue-600">
                                        Rp {{ number_format($item->produk->harga * $item->jumlah, 0, ',', '.') }}
                                    </span>
                                </div>
                            </div>
                        @endif
                    @endforeach
                </div>

                <!-- Summary & Checkout Sidebar -->
                <div class="lg:col-span-4">
                    <div class="card-volt p-6 sticky top-24">
                        <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                            Ringkasan Belanja
                        </h2>

                        <div class="space-y-3 text-sm mb-6">
                            <div class="flex justify-between text-slate-600">
                                <span>Total Item</span>
                                <span class="font-semibold text-slate-800">{{ $keranjang->sum('jumlah') }} unit</span>
                            </div>
                            <div class="flex justify-between text-slate-600">
                                <span>Estimasi Ongkos Kirim</span>
                                <span class="text-emerald-600 font-semibold">Gratis</span>
                            </div>
                            <div class="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                                <span class="font-bold text-slate-900">Total Harga</span>
                                <span class="text-xl font-extrabold text-blue-600">
                                    Rp {{ number_format($totalHarga, 0, ',', '.') }}
                                </span>
                            </div>
                        </div>

                        <a href="{{ route('checkout.index') }}" class="btn-volt w-full py-3.5 text-sm font-semibold">
                            <span>Lanjut ke Checkout</span>
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </a>

                        <a href="{{ route('katalog.index') }}" class="btn-volt-secondary w-full py-2.5 text-xs font-semibold mt-2.5">
                            Lanjut Belanja
                        </a>
                    </div>
                </div>

            </div>
        @else
            <div class="card-volt text-center py-20 p-8 max-w-lg mx-auto">
                <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="shopping-bag" class="w-8 h-8"></i>
                </div>
                <h2 class="text-lg font-bold text-slate-800">Keranjang Belanja Masih Kosong</h2>
                <p class="text-xs text-slate-500 mt-1 mb-6">Jelajahi berbagai pilihan laptop, hardware, dan aksesori unggulan di Voltiva.</p>
                <a href="{{ route('katalog.index') }}" class="btn-volt">
                    <span>Mulai Belanja</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>
            </div>
        @endif

    </div>
</div>
@endsection
