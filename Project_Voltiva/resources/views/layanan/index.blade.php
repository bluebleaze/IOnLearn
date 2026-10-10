@extends('layouts.main')

@section('title', 'Layanan Servis & Upgrade Laptop - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <!-- Breadcrumb & Header Hero -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
            <!-- Decorative Glow -->
            <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative max-w-3xl space-y-4">
                <nav class="flex items-center gap-2 text-xs text-slate-400">
                    <a href="{{ route('home') }}" class="hover:text-blue-400 transition-colors">Beranda</a>
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    <span class="text-blue-400 font-medium">Layanan Servis & Upgrade</span>
                </nav>

                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
                    <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
                    <span>VOLTIVA SERVICE & UPGRADE CENTER</span>
                </div>

                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                    Solusi Perawatan & Peningkatan 
                    <span class="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                        Performa Laptop Anda
                    </span>
                </h1>

                <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Dikerjakan langsung oleh teknisi berpengalaman dengan jaminan transparansi biaya, sparepart berkualitas tinggi, dan garansi resmi toko.
                </p>

                <div class="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                    <div class="flex items-center gap-2">
                        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
                        <span>Diagnosa Awal Gratis</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="shield-check" class="w-4 h-4 text-blue-400"></i>
                        <span>Garansi Pengerjaan s/d 3 Bulan</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>
                        <span>Estimasi Cepat & Tepat</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Kategori & Pencarian -->
        <div class="card-volt p-5 sm:p-6 space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <!-- Tabs Kategori -->
                <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    @foreach($kategoriList as $kat)
                        @php
                            $isActive = ($kategoriDipilih === $kat) || (empty($kategoriDipilih) && $kat === 'Semua');
                        @endphp
                        <a href="{{ route('layanan.index', array_merge(request()->query(), ['kategori' => $kat])) }}"
                           class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 {{ $isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900' }}">
                            <span>{{ $kat }}</span>
                            @if(isset($jumlahPerKategori[$kat]))
                                <span class="px-1.5 py-0.5 rounded-md text-[10px] {{ $isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700' }}">
                                    {{ $jumlahPerKategori[$kat] }}
                                </span>
                            @endif
                        </a>
                    @endforeach
                </div>

                <!-- Form Search -->
                <form action="{{ route('layanan.index') }}" method="GET" class="relative w-full md:w-80 shrink-0">
                    @if(request('kategori') && request('kategori') !== 'Semua')
                        <input type="hidden" name="kategori" value="{{ request('kategori') }}">
                    @endif
                    <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari layanan (cleaning, ssd, os)..."
                        class="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    @if(request('q'))
                        <a href="{{ route('layanan.index', ['kategori' => request('kategori')]) }}" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </a>
                    @endif
                </form>
            </div>
        </div>

        <!-- Grid Daftar Layanan -->
        @if($layananList->isEmpty())
            <div class="card-volt p-12 text-center space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <i data-lucide="search-x" class="w-8 h-8"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800">Layanan Tidak Ditemukan</h3>
                <p class="text-sm text-slate-500 max-w-md mx-auto">
                    Tidak ada layanan yang cocok dengan kata kunci pencarian atau kategori yang Anda pilih.
                </p>
                <div>
                    <a href="{{ route('layanan.index') }}" class="btn-volt text-xs">
                        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                        <span>Reset Filter</span>
                    </a>
                </div>
            </div>
        @else
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                @foreach($layananList as $item)
                    <div class="card-volt hover:shadow-lg hover:border-blue-200/80 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                        <div class="p-6 space-y-5">
                            <!-- Card Header: Icon & Category Badge -->
                            <div class="flex items-start justify-between gap-3">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                                    @php
                                        $iconName = $item->icon ?: 'wrench';
                                    @endphp
                                    <i data-lucide="{{ $iconName }}" class="w-6 h-6"></i>
                                </div>
                                <span class="badge-volt text-[11px] font-semibold tracking-wide">
                                    {{ $item->kategori_layanan }}
                                </span>
                            </div>

                            <!-- Title & Description -->
                            <div class="space-y-2">
                                <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    <a href="{{ route('layanan.show', $item->slug) }}">
                                        {{ $item->nama_layanan }}
                                    </a>
                                </h3>
                                <p class="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                                    {{ $item->deskripsi }}
                                </p>
                            </div>

                            <!-- Benefits Highlights -->
                            @if(!empty($item->daftar_keuntungan))
                                <div class="pt-2 border-t border-slate-100 space-y-2">
                                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Keuntungan:</span>
                                    <ul class="space-y-1.5 text-xs text-slate-600">
                                        @foreach(array_slice($item->daftar_keuntungan, 0, 3) as $benefit)
                                            <li class="flex items-start gap-2">
                                                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"></i>
                                                <span class="leading-snug">{{ $benefit }}</span>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif

                            <!-- Meta Info: Durasi & Garansi -->
                            <div class="grid grid-cols-2 gap-2 pt-2 text-[11px] font-medium text-slate-600">
                                <div class="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <i data-lucide="clock" class="w-3.5 h-3.5 text-blue-500 shrink-0"></i>
                                    <span class="truncate">{{ $item->estimasi_waktu }}</span>
                                </div>
                                <div class="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-500 shrink-0"></i>
                                    <span class="truncate">{{ $item->garansi }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer: Pricing & Action Buttons -->
                        <div class="p-6 pt-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div>
                                <span class="text-[10px] uppercase font-semibold text-slate-400 block">Biaya Layanan</span>
                                @if($item->biaya_mulai_dari <= 0)
                                    <span class="text-base sm:text-lg font-extrabold text-emerald-600">GRATIS</span>
                                @else
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-[11px] font-medium text-slate-500">Mulai</span>
                                        <span class="text-base sm:text-lg font-extrabold text-slate-900">
                                            Rp {{ number_format($item->biaya_mulai_dari, 0, ',', '.') }}
                                        </span>
                                    </div>
                                @endif
                            </div>

                            <div class="flex items-center gap-2">
                                <a href="{{ route('layanan.show', $item->slug) }}" 
                                   class="p-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:text-blue-600 hover:border-blue-300 transition-all shadow-xs" 
                                   title="Detail Layanan">
                                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                </a>
                                @php
                                    $pesanWa = urlencode("Halo Tim Voltiva, saya ingin konsultasi mengenai layanan *" . $item->nama_layanan . "*.");
                                @endphp
                                <a href="https://wa.me/6281234567890?text={{ $pesanWa }}" target="_blank"
                                   class="btn-volt py-2 px-3.5 text-xs font-semibold shadow-xs">
                                    <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                                    <span>Konsultasi</span>
                                </a>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif

        <!-- Section: Mengapa Memilih Voltiva Service Center? -->
        <div class="card-volt p-8 sm:p-10 space-y-8 bg-gradient-to-br from-white to-slate-50">
            <div class="text-center max-w-2xl mx-auto space-y-2">
                <span class="badge-volt text-xs font-semibold">STANDAR KUALITAS TINGGI</span>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Mengapa Mempercayakan Servis ke Voltiva?
                </h2>
                <p class="text-sm text-slate-500">
                    Kami menjaga perangkat berharga Anda dengan standar penanganan profesional dan peralatan laboratorium servis modern.
                </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <i data-lucide="badge-check" class="w-5 h-5"></i>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm">Teknisi Tersertifikasi</h4>
                    <p class="text-xs text-slate-500 leading-relaxed">
                        Ditangani oleh tim teknisi berpengalaman yang memahami arsitektur laptop modern dari berbagai brand terkemuka.
                    </p>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i data-lucide="cpu" class="w-5 h-5"></i>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm">Sparepart 100% Original</h4>
                    <p class="text-xs text-slate-500 leading-relaxed">
                        Kami hanya menggunakan suku cadang asli dan pasta termal grade tertinggi demi kestabilan perangkat jangka panjang.
                    </p>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm">Transparansi Penuh</h4>
                    <p class="text-xs text-slate-500 leading-relaxed">
                        Konfirmasi biaya dilakukan sebelum tindakan perbaikan. Tidak ada biaya siluman atau penggantian komponen tanpa izin.
                    </p>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm">Garansi Resmi Toko</h4>
                    <p class="text-xs text-slate-500 leading-relaxed">
                        Setiap pengerjaan servis dan penggantian part dilindungi nota garansi resmi toko untuk ketenangan pikiran Anda.
                    </p>
                </div>
            </div>
        </div>

        <!-- Section: Tanya Jawab Seputar Servis (FAQ) -->
        <div class="card-volt p-8 sm:p-10 space-y-6">
            <div class="space-y-2">
                <span class="text-xs font-bold text-blue-600 tracking-wider uppercase">Pusat Informasi</span>
                <h2 class="text-2xl font-extrabold text-slate-900">Pertanyaan yang Sering Diajukan</h2>
            </div>

            <div class="divide-y divide-slate-100 text-sm text-slate-600 space-y-4 pt-2">
                <div class="pt-3 space-y-1">
                    <h4 class="font-bold text-slate-800 flex items-center gap-2">
                        <i data-lucide="help-circle" class="w-4 h-4 text-blue-600 shrink-0"></i>
                        Berapa lama proses pengerjaan servis atau upgrade laptop?
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-500 pl-6 leading-relaxed">
                        Untuk pembersihan (cleaning), ganti pasta, serta upgrade RAM/SSD rata-rata selesai dalam waktu 1 hingga 3 jam (bisa ditunggu). Untuk pergantian panel layar LCD atau perbaikan motherboard membutuhkan 1 - 2 hari kerja.
                    </p>
                </div>

                <div class="pt-4 space-y-1">
                    <h4 class="font-bold text-slate-800 flex items-center gap-2">
                        <i data-lucide="help-circle" class="w-4 h-4 text-blue-600 shrink-0"></i>
                        Apakah data saya aman saat servis atau upgrade?
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-500 pl-6 leading-relaxed">
                        Keamanan dan privasi data pelanggan adalah prioritas utama kami. Untuk tindakan pembersihan dan upgrade hardware, data tidak akan tersentuh. Untuk reinstal OS, kami selalu menyediakan opsi backup data menyeluruh.
                    </p>
                </div>

                <div class="pt-4 space-y-1">
                    <h4 class="font-bold text-slate-800 flex items-center gap-2">
                        <i data-lucide="help-circle" class="w-4 h-4 text-blue-600 shrink-0"></i>
                        Bagaimana cara booking atau konsultasi sebelum datang ke toko?
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-500 pl-6 leading-relaxed">
                        Anda bisa langsung menghubungi tim teknisi kami melalui tombol WhatsApp pada masing-masing layanan untuk menyampaikan kendala laptop Anda dan mendapatkan estimasi ketersediaan sparepart.
                    </p>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
