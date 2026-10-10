@extends('layouts.main')

@section('title', $produk->nama_produk . ' - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <a href="{{ route('katalog.index') }}" class="hover:text-blue-600 transition-colors">Katalog</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium truncate max-w-xs">{{ $produk->nama_produk }}</span>
        </nav>

        <!-- Product Main Card -->
        <div class="card-volt p-6 sm:p-8 mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                <!-- Product Image Section -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="w-full h-80 sm:h-96 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/80 p-4">
                        @if($produk->gambar && file_exists(public_path('storage/' . $produk->gambar)))
                            <img src="{{ asset('storage/' . $produk->gambar) }}" alt="{{ $produk->nama_produk }}" class="w-full h-full object-contain hover:scale-105 transition-transform duration-300">
                        @else
                            <div class="flex flex-col items-center justify-center text-slate-400 gap-3">
                                <i data-lucide="laptop" class="w-20 h-20 text-slate-300"></i>
                                <span class="text-sm font-medium">Voltiva Tech Preview</span>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Product Information & Action Section -->
                <div class="lg:col-span-7 flex flex-col justify-between">
                    <div>
                        <!-- Category & Brand -->
                        <div class="flex items-center gap-2 mb-3">
                            @if($produk->brand)
                                <span class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                    {{ $produk->brand->nama_brand }}
                                </span>
                            @endif
                            @if($produk->kategori)
                                <span class="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {{ $produk->kategori->nama_kategori }}
                                </span>
                            @endif
                        </div>

                        <!-- Product Title -->
                        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
                            {{ $produk->nama_produk }}
                        </h1>

                        <!-- Price & Stock Status -->
                        <div class="flex items-baseline gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                            <div>
                                <span class="text-xs uppercase font-semibold text-slate-400 block">Harga Resmi</span>
                                <div class="text-2xl sm:text-3xl font-extrabold text-blue-600">
                                    Rp {{ number_format($produk->harga, 0, ',', '.') }}
                                </div>
                            </div>
                            <div class="ml-auto flex items-center gap-2">
                                @if($produk->stok > 0)
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Stok Tersedia: {{ $produk->stok }} unit
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        <span class="w-2 h-2 rounded-full bg-red-500"></span>
                                        Stok Habis
                                    </span>
                                @endif
                            </div>
                        </div>

                        <!-- Product Description -->
                        <div class="space-y-2 mb-8">
                            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900">Deskripsi Produk</h3>
                            <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {{ $produk->deskripsi_produk }}
                            </div>
                        </div>
                    </div>

                    <!-- Add to Cart Form -->
                    <div class="pt-6 border-t border-slate-200">
                        @if($produk->stok > 0)
                            <form action="{{ route('keranjang.store') }}" method="POST" class="flex flex-col sm:flex-row items-center gap-4">
                                @csrf
                                <input type="hidden" name="produk_id" value="{{ $produk->id }}">

                                <div class="flex items-center gap-3 w-full sm:w-auto">
                                    <label for="jumlah" class="text-xs font-semibold text-slate-600 shrink-0">Jumlah:</label>
                                    <input type="number" id="jumlah" name="jumlah" value="1" min="1" max="{{ $produk->stok }}"
                                        class="w-24 py-2.5 px-3 text-center text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>

                                <button type="submit" class="btn-volt w-full sm:flex-1 py-3 text-sm font-semibold">
                                    <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                    <span>Masukkan ke Keranjang</span>
                                </button>
                            </form>
                        @else
                            <button type="button" disabled class="w-full py-3 px-6 rounded-xl bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed text-center">
                                Stok Habis - Tidak Dapat Dipesan
                            </button>
                        @endif
                    </div>

                </div>

            </div>
        </div>

        <!-- Related Products Section -->
        @if(isset($produkTerkait) && $produkTerkait->count() > 0)
            <div class="mt-12">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Produk Terkait Lainnya</h2>
                    <a href="{{ route('katalog.index', ['kategori' => $produk->kategori_id]) }}" class="text-xs sm:text-sm font-semibold text-blue-600 hover:underline">
                        Lihat Lebih Banyak &rarr;
                    </a>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    @foreach($produkTerkait as $rel)
                        <div class="card-volt flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-200 group">
                            <div class="w-full h-40 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                                @if($rel->gambar && file_exists(public_path('storage/' . $rel->gambar)))
                                    <img src="{{ asset('storage/' . $rel->gambar) }}" alt="{{ $rel->nama_produk }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200">
                                @else
                                    <i data-lucide="laptop" class="w-10 h-10 text-slate-300"></i>
                                @endif
                            </div>
                            <div class="p-4 flex-1 flex flex-col justify-between">
                                <h4 class="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
                                    <a href="{{ route('katalog.show', $rel->id) }}">
                                        {{ $rel->nama_produk }}
                                    </a>
                                </h4>
                                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span class="text-xs font-bold text-blue-600">
                                        Rp {{ number_format($rel->harga, 0, ',', '.') }}
                                    </span>
                                    <a href="{{ route('katalog.show', $rel->id) }}" class="text-slate-400 hover:text-blue-600">
                                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

    </div>
</div>
@endsection
