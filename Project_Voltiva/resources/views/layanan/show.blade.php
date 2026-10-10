@extends('layouts.main')

@section('title', $layanan->nama_layanan . ' - Servis Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-slate-500">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <a href="{{ route('layanan.index') }}" class="hover:text-blue-600 transition-colors">Layanan Servis</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium">{{ $layanan->nama_layanan }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Kolom Kiri: Detail Layanan -->
            <div class="lg:col-span-8 space-y-8">
                
                <!-- Main Header Card -->
                <div class="card-volt p-6 sm:p-8 space-y-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                            <i data-lucide="{{ $layanan->icon ?: 'wrench' }}" class="w-7 h-7"></i>
                        </div>
                        <span class="badge-volt font-semibold">
                            {{ $layanan->kategori_layanan }}
                        </span>
                    </div>

                    <div class="space-y-3">
                        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {{ $layanan->nama_layanan }}
                        </h1>
                        <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
                            {{ $layanan->deskripsi }}
                        </p>
                    </div>

                    <!-- Meta Badges -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div class="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center">
                                <i data-lucide="clock" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <span class="text-[10px] uppercase font-bold text-slate-400 block">Estimasi Waktu</span>
                                <span class="text-sm font-bold text-slate-800">{{ $layanan->estimasi_waktu }}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div class="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                                <i data-lucide="shield-check" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <span class="text-[10px] uppercase font-bold text-slate-400 block">Garansi Pengerjaan</span>
                                <span class="text-sm font-bold text-slate-800">{{ $layanan->garansi }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Keuntungan / Detail Cakupan Layanan -->
                @if(!empty($layanan->daftar_keuntungan))
                    <div class="card-volt p-6 sm:p-8 space-y-4">
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>
                            <span>Apa Saja yang Anda Dapatkan?</span>
                        </h2>
                        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            @foreach($layanan->daftar_keuntungan as $benefit)
                                <li class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700">
                                    <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"></i>
                                    <span>{{ $benefit }}</span>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <!-- Prosedur Servis -->
                <div class="card-volt p-6 sm:p-8 space-y-6">
                    <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <i data-lucide="git-commit" class="w-5 h-5 text-blue-600"></i>
                        <span>Alur Proses Servis di Voltiva</span>
                    </h2>

                    <div class="space-y-4">
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                            <div class="space-y-1">
                                <h4 class="font-bold text-slate-800 text-sm">Konsultasi & Diagnosa Awal</h4>
                                <p class="text-xs text-slate-500">Hubungi kami via WhatsApp atau bawa unit langsung ke toko untuk pemeriksaan awal gratis.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                            <div class="space-y-1">
                                <h4 class="font-bold text-slate-800 text-sm">Konfirmasi Solusi & Biaya</h4>
                                <p class="text-xs text-slate-500">Teknisi menjelaskan opsi tindakan dan rincian harga secara transparan sebelum dikerjakan.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                            <div class="space-y-1">
                                <h4 class="font-bold text-slate-800 text-sm">Pengerjaan & Quality Check</h4>
                                <p class="text-xs text-slate-500">Unit dikerjakan secara teliti dengan pengujian performa menyeluruh sebelum diserahkan kembali.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
                            <div class="space-y-1">
                                <h4 class="font-bold text-slate-800 text-sm">Penyerahan & Nota Garansi</h4>
                                <p class="text-xs text-slate-500">Unit siap diambil, disertai nota resmi dan masa garansi aktif sesuai ketentuan layanan.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Kolom Kanan: Card Booking / CTA -->
            <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                <div class="card-volt p-6 space-y-6 shadow-md border-blue-100">
                    <div>
                        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Estimasi Biaya</span>
                        @if($layanan->biaya_mulai_dari <= 0)
                            <div class="text-3xl font-extrabold text-emerald-600 mt-1">GRATIS</div>
                            <p class="text-xs text-slate-500 mt-1">Tanpa biaya diagnosa dan tanpa paksaan perbaikan</p>
                        @else
                            <div class="text-3xl font-extrabold text-slate-900 mt-1">
                                Rp {{ number_format($layanan->biaya_mulai_dari, 0, ',', '.') }}
                            </div>
                            <p class="text-xs text-slate-500 mt-1">Harga mulai dari, disesuaikan dengan tipe part / komponen</p>
                        @endif
                    </div>

                    <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2 text-xs text-blue-900">
                        <div class="flex items-center gap-2 font-semibold">
                            <i data-lucide="info" class="w-4 h-4 text-blue-600"></i>
                            <span>Catatan Teknisi:</span>
                        </div>
                        <p class="text-blue-800/80 leading-relaxed">
                            Biaya penggantian sparepart bersifat estimasi awal dan akan dikonfirmasikan terlebih dahulu sebelum proses pengerjaan dimulai.
                        </p>
                    </div>

                    @php
                        $pesanWa = urlencode("Halo Tim Voltiva, saya ingin konsultasi dan booking layanan *" . $layanan->nama_layanan . "* untuk laptop saya.");
                    @endphp

                    <div class="space-y-3">
                        <a href="https://wa.me/6281234567890?text={{ $pesanWa }}" target="_blank"
                           class="btn-volt w-full py-3 text-sm font-semibold shadow-md shadow-blue-500/20">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>
                            <span>Hubungi Teknisi via WhatsApp</span>
                        </a>

                        <a href="{{ route('layanan.index') }}" 
                           class="btn-volt-secondary w-full py-2.5 text-xs">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                            <span>Kembali ke Katalog Layanan</span>
                        </a>
                    </div>
                </div>

                <!-- Layanan Terkait -->
                @if($layananTerkait->isNotEmpty())
                    <div class="card-volt p-6 space-y-4">
                        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Layanan Terkait</h3>
                        <div class="space-y-3">
                            @foreach($layananTerkait as $terkait)
                                <a href="{{ route('layanan.show', $terkait->slug) }}" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <i data-lucide="{{ $terkait->icon ?: 'wrench' }}" class="w-4 h-4"></i>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <h5 class="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600">{{ $terkait->nama_layanan }}</h5>
                                        <span class="text-[11px] text-slate-500">Mulai Rp {{ number_format($terkait->biaya_mulai_dari, 0, ',', '.') }}</span>
                                    </div>
                                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform"></i>
                                </a>
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>

        </div>

    </div>
</div>
@endsection
