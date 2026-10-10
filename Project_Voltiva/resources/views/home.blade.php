@extends('layouts.main')

@section('title', 'Voltiva - Official Tech & Hardware Store')

@section('content')
<!-- Hero Section -->
<section class="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-16 sm:py-24">
    <!-- Decorative background glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/20 blur-3xl pointer-events-none rounded-full"></div>
    <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-sky-500/10 blur-3xl pointer-events-none rounded-full"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <!-- Left Headline -->
            <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-medium">
                    <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span>Pusat Hardware & Gadget Performa Tinggi</span>
                </div>

                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                    Tingkatkan Performa Anda dengan 
                    <span class="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
                        Voltiva
                    </span>
                </h1>

                <p class="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                    Temukan laptop gaming impian, komponen komputer mutakhir, dan aksesori premium bergaransi resmi untuk menunjang produktivitas dan hiburan Anda.
                </p>

                <!-- CTA Buttons -->
                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                    <a href="{{ route('katalog.index') }}" class="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200">
                        <span>Jelajahi Katalog</span>
                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </a>
                    <a href="#kategori" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all duration-200">
                        <span>Pilihan Kategori</span>
                        <i data-lucide="grid" class="w-4 h-4 text-slate-400"></i>
                    </a>
                </div>

                <!-- Trust Badges -->
                <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-center sm:text-left">
                    <div>
                        <p class="text-2xl font-bold text-white">100%</p>
                        <p class="text-xs text-slate-400">Produk Asli & Resmi</p>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-white">Garansi</p>
                        <p class="text-xs text-slate-400">Proteksi Terjamin</p>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-white">Cepat</p>
                        <p class="text-xs text-slate-400">Pengiriman Aman</p>
                    </div>
                </div>
            </div>

            <!-- Right Showcase Card -->
            <div class="lg:col-span-5 flex justify-center">
                <div class="relative w-full max-w-md p-6 bg-slate-800/60 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl shadow-blue-950/50">
                    <div class="flex items-center justify-between mb-4">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Unggulan Hari Ini
                        </span>
                        <span class="text-xs text-slate-400">Voltiva Official</span>
                    </div>

                    <!-- Highlight Visual -->
                    <div class="w-full h-52 bg-gradient-to-br from-slate-900 to-blue-950/80 rounded-2xl flex items-center justify-center p-4 border border-slate-700/50 relative overflow-hidden group">
                        @if(file_exists(public_path('images/logo.png')))
                            <img src="{{ asset('images/logo.png') }}" alt="Voltiva" class="w-32 h-32 object-contain filter drop-shadow-[0_10px_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-300">
                        @else
                            <i data-lucide="cpu" class="w-24 h-24 text-blue-400/80"></i>
                        @endif
                    </div>

                    <div class="mt-5 space-y-2">
                        <h3 class="text-lg font-bold text-white">ROG Zephyrus & High-End Tech</h3>
                        <p class="text-xs text-slate-400 leading-relaxed">
                            Rasakan teknologi komputasi generasi terbaru dengan efisiensi daya dan performa ekstrem.
                        </p>
                        <div class="pt-3 flex items-center justify-between">
                            <span class="text-xs text-slate-400">Mulai dari</span>
                            <span class="text-lg font-bold text-sky-400">Rp Terjangkau</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</section>

<!-- Category Pills Section -->
@if(isset($kategori) && $kategori->count() > 0)
<section id="kategori" class="py-12 bg-white border-b border-slate-200/70">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Kategori Pilihan</h2>
                <p class="text-xs sm:text-sm text-slate-500">Temukan perangkat sesuai kebutuhan spesifik Anda</p>
            </div>
            <a href="{{ route('katalog.index') }}" class="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                Lihat Semua <i data-lucide="chevron-right" class="w-4 h-4 group-hover:translate-x-0.5 transition-transform"></i>
            </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            @foreach($kategori as $kat)
                <a href="{{ route('katalog.index', ['kategori' => $kat->id]) }}" 
                   class="group flex flex-col items-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition-all duration-200 text-center">
                    <div class="w-12 h-12 rounded-xl bg-white group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shadow-xs border border-slate-100 group-hover:border-transparent transition-all duration-200 mb-3">
                        <i data-lucide="layers" class="w-6 h-6"></i>
                    </div>
                    <span class="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {{ $kat->nama_kategori }}
                    </span>
                </a>
            @endforeach
        </div>
    </div>
</section>
@endif

<!-- Latest Products Section -->
<section class="py-14 sm:py-20 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
                    <i data-lucide="zap" class="w-3.5 h-3.5"></i> Koleksi Baru
                </div>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Produk Terbaru</h2>
                <p class="text-sm text-slate-500 mt-1">Daftar perangkat hardware dan teknologi terkini yang siap dipesan</p>
            </div>
            <a href="{{ route('katalog.index') }}" class="btn-volt-secondary text-sm">
                <span>Buka Katalog Lengkap</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
        </div>

        @if(isset($produkTerbaru) && $produkTerbaru->count() > 0)
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                @foreach($produkTerbaru as $item)
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

                            <!-- Badges -->
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

                                <a href="{{ route('katalog.show', $item->id) }}" class="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200" title="Lihat Produk">
                                    <i data-lucide="eye" class="w-4 h-4"></i>
                                </a>
                            </div>
                        </div>

                    </div>
                @endforeach
            </div>
        @else
            <div class="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
                <i data-lucide="package-open" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <h3 class="text-base font-semibold text-slate-800">Belum ada produk aktif</h3>
                <p class="text-xs text-slate-500 mt-1">Silakan tambahkan data produk melalui panel admin atau jalankan seeder database.</p>
            </div>
        @endif
    </div>
</section>

<!-- Banner Promosi Layanan Servis & Upgrade -->
<section class="py-12 bg-slate-100/70 border-t border-slate-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white p-8 sm:p-12 shadow-xl border border-blue-800/50">
            <!-- Background Glow -->
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-8 space-y-4">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                        <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
                        <span>VOLTIVA SERVICE & REPAIR</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Laptop Lemot, Panas, atau Ingin Upgrade SSD & RAM?
                    </h2>
                    <p class="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                        Kami menyediakan layanan deep cleaning, thermal repaste, instalasi OS, hingga perbaikan hardware dengan teknisi tersertifikasi, biaya transparan, dan garansi resmi.
                    </p>
                    <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                        <span class="flex items-center gap-1.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Diagnosa Awal Gratis</span>
                        <span class="flex items-center gap-1.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Sparepart Original</span>
                        <span class="flex items-center gap-1.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Garansi Pengerjaan</span>
                    </div>
                </div>

                <div class="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3">
                    <a href="{{ route('layanan.index') }}" class="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 w-full sm:w-auto text-center">
                        <i data-lucide="cpu" class="w-4 h-4"></i>
                        <span>Lihat Layanan Servis</span>
                    </a>
                    <a href="https://wa.me/6281234567890?text=Halo%20Voltiva,%20saya%20ingin%20konsultasi%20servis%20laptop" target="_blank" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200 w-full sm:w-auto text-center">
                        <i data-lucide="message-circle" class="w-4 h-4 text-emerald-400"></i>
                        <span>Konsultasi WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features / Value Prop -->
<section class="py-16 bg-white border-t border-slate-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <i data-lucide="shield-check" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 text-sm">100% Produk Asli</h4>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">Semua unit berasal dari distributor resmi dengan segel orisinal.</p>
                </div>
            </div>

            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <i data-lucide="truck" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 text-sm">Packing Ekstra Aman</h4>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">Pengiriman terlindungi bubble wrap tebal dan asuransi penuh.</p>
                </div>
            </div>

            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <i data-lucide="award" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 text-sm">Garansi Resmi</h4>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">Klaim garansi mudah melalui pusat servis resmi di seluruh Indonesia.</p>
                </div>
            </div>

            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <i data-lucide="headphones" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 text-sm">Bantuan Responsif</h4>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">Tim teknis siap membantu konsultasi spesifikasi sebelum membeli.</p>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
