@extends('layouts.admin')

@section('title', 'Dashboard Admin - Voltiva')
@section('header_title', 'Ringkasan Dashboard')

@section('content')
<div class="space-y-8">
    
    <!-- Welcome Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-8 text-white shadow-xl shadow-blue-500/10">
        <div class="relative z-10 max-w-2xl">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Selamat Datang di Panel Admin Voltiva
            </h1>
            <p class="text-sm text-blue-100 leading-relaxed">
                Kelola inventaris hardware, pantau pesanan pelanggan, dan tinjau kritik & saran secara real-time dari satu dashboard terpusat.
            </p>
        </div>
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        @php
            $statProduk = \App\Models\Produk::count();
            $statKategori = \App\Models\Kategori::count();
            $statBrand = \App\Models\Brand::count();
            $statPesanan = \App\Models\Pesanan::count();
        @endphp

        <!-- Card Produk -->
        <div class="card-volt p-6 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Produk</p>
                <h3 class="text-2xl font-extrabold text-slate-900 mt-1">{{ $statProduk }}</h3>
                <a href="{{ route('admin.produk.index') }}" class="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                    Kelola Produk &rarr;
                </a>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i data-lucide="package" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Card Kategori -->
        <div class="card-volt p-6 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</p>
                <h3 class="text-2xl font-extrabold text-slate-900 mt-1">{{ $statKategori }}</h3>
                <a href="{{ route('admin.kategori.index') }}" class="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                    Kelola Kategori &rarr;
                </a>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <i data-lucide="tag" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Card Brand -->
        <div class="card-volt p-6 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand Terdaftar</p>
                <h3 class="text-2xl font-extrabold text-slate-900 mt-1">{{ $statBrand }}</h3>
                <a href="{{ route('admin.brand.index') }}" class="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                    Kelola Brand &rarr;
                </a>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <i data-lucide="badge-check" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Card Pesanan -->
        <div class="card-volt p-6 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pesanan</p>
                <h3 class="text-2xl font-extrabold text-slate-900 mt-1">{{ $statPesanan }}</h3>
                <a href="{{ route('admin.pesanan.index') }}" class="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                    Lihat Pesanan &rarr;
                </a>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i data-lucide="shopping-cart" class="w-6 h-6"></i>
            </div>
        </div>
    </div>

    <!-- Quick Actions Panel -->
    <div class="card-volt p-6">
        <h3 class="text-base font-bold text-slate-900 mb-4">Aksi Cepat Admin</h3>
        <div class="flex flex-wrap gap-3">
            <a href="{{ route('admin.produk.create') }}" class="btn-volt text-xs">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>Tambah Produk Baru</span>
            </a>
            <a href="{{ route('admin.kategori.create') }}" class="btn-volt-secondary text-xs">
                <i data-lucide="folder-plus" class="w-4 h-4"></i>
                <span>Tambah Kategori</span>
            </a>
            <a href="{{ route('admin.brand.create') }}" class="btn-volt-secondary text-xs">
                <i data-lucide="bookmark-plus" class="w-4 h-4"></i>
                <span>Tambah Brand</span>
            </a>
            <a href="{{ route('admin.pesanan.index') }}" class="btn-volt-secondary text-xs">
                <i data-lucide="truck" class="w-4 h-4"></i>
                <span>Cek Pesanan Masuk</span>
            </a>
        </div>
    </div>

</div>
@endsection
