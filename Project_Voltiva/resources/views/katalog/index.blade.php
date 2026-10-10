@extends('layouts.main')

@section('title', 'Katalog Produk - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb & Header -->
        <div class="mb-8">
            <nav class="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                <span class="text-slate-800 font-medium">Katalog Produk</span>
            </nav>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Katalog Produk Voltiva</h1>
            <p class="text-sm text-slate-500 mt-1">Jelajahi lini produk teknologi dan hardware performa tinggi kami</p>
        </div>

        <!-- Filter & Search Bar -->
        <div class="card-volt p-5 mb-8">
            <form action="{{ route('katalog.index') }}" method="GET" class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <!-- Search Keyword -->
                <div class="md:col-span-6 relative">
                    <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari nama laptop, periferal, atau brand..."
                        class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                </div>

                <!-- Kategori Dropdown -->
                <div class="md:col-span-3">
                    <select name="kategori" class="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Semua Kategori</option>
                        @foreach($kategori as $kat)
                            <option value="{{ $kat->id }}" {{ request('kategori') == $kat->id ? 'selected' : '' }}>
                                {{ $kat->nama_kategori }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Submit & Reset Buttons -->
                <div class="md:col-span-3 flex items-center gap-2">
                    <button type="submit" class="btn-volt flex-1 py-2.5 text-sm">
                        <i data-lucide="filter" class="w-4 h-4"></i>
                        <span>Filter</span>
                    </button>
                    @if(request()->hasAny(['q', 'kategori']))
                        <a href="{{ route('katalog.index') }}" class="btn-volt-secondary py-2.5 text-sm" title="Reset Filter">
                            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                        </a>
                    @endif
                </div>
            </form>
        </div>

        <!-- Active Filter Badges -->
        @if(request()->hasAny(['q', 'kategori']))
            <div class="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-600">
                <span class="font-semibold">Filter Aktif:</span>
                @if(request('q'))
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Kata kunci: "{{ request('q') }}"
                    </span>
                @endif
                @if(request('kategori'))
                    @php
                        $selectedKat = $kategori->firstWhere('id', request('kategori'));
                    @endphp
                    @if($selectedKat)
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Kategori: {{ $selectedKat->nama_kategori }}
                        </span>
                    @endif
                @endif
                <a href="{{ route('katalog.index') }}" class="text-blue-600 hover:underline font-semibold ml-2">Hapus Semua</a>
            </div>
        @endif

        <!-- Products Grid -->
        @if($produk->count() > 0)
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                @foreach($produk as $item)
                    <div class="card-volt flex flex-col h-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                        
                        <!-- Image Container -->
                        <div class="relative w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                            @if($item->gambar && file_exists(public_path('storage/' . $item->gambar)))
                                <img src="{{ asset('storage/' . $item->gambar) }}" alt="{{ $item->nama_produk }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            @else
                                <div class="flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
                                    <i data-lucide="laptop" class="w-12 h-12 text-slate-300"></i>
                                    <span class="text-xs text-slate-400 text-center font-medium">Voltiva Tech</span>
                                </div>
                            @endif

                            <!-- Category Badge -->
                            <div class="absolute top-3 left-3 flex flex-col gap-1">
                                @if($item->kategori)
                                    <span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs border border-slate-200/50">
                                        {{ $item->kategori->nama_kategori }}
                                    </span>
                                @endif
                            </div>

                            @if($item->stok > 0)
                                <span class="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/90 text-white shadow-xs">
                                    Stok: {{ $item->stok }}
                                </span>
                            @else
                                <span class="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/90 text-white shadow-xs">
                                    Habis
                                </span>
                            @endif
                        </div>

                        <!-- Content Details -->
                        <div class="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                @if($item->brand)
                                    <span class="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                                        {{ $item->brand->nama_brand }}
                                    </span>
                                @endif
                                <h3 class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-base mb-1.5" title="{{ $item->nama_produk }}">
                                    <a href="{{ route('katalog.show', $item->id) }}">
                                        {{ $item->nama_produk }}
                                    </a>
                                </h3>
                                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                    {{ $item->deskripsi_produk }}
                                </p>
                            </div>

                            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <span class="text-[10px] uppercase font-semibold text-slate-400 block">Harga</span>
                                    <span class="text-base font-extrabold text-blue-600">
                                        Rp {{ number_format($item->harga, 0, ',', '.') }}
                                    </span>
                                </div>

                                <a href="{{ route('katalog.show', $item->id) }}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors duration-200">
                                    <span>Detail</span>
                                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                                </a>
                            </div>
                        </div>

                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-8 flex justify-center">
                {{ $produk->links() }}
            </div>
        @else
            <div class="card-volt text-center py-16 p-8">
                <i data-lucide="search-x" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <h3 class="text-base font-semibold text-slate-800">Tidak ada produk ditemukan</h3>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Coba sesuaikan kata kunci pencarian atau bersihkan filter kategori Anda.
                </p>
                <div class="mt-4">
                    <a href="{{ route('katalog.index') }}" class="btn-volt-secondary text-xs">
                        Reset Filter
                    </a>
                </div>
            </div>
        @endif

    </div>
</div>
@endsection
