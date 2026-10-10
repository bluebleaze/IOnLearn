@extends('layouts.main')

@section('title', 'Kirim Kritik & Saran - Voltiva')

@section('content')
<div class="py-12 bg-slate-50 min-h-screen">
    <div class="max-w-2xl mx-auto px-4 sm:px-6">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium">Kritik & Saran</span>
        </nav>

        <div class="card-volt p-6 sm:p-8 bg-white shadow-xl shadow-slate-200/50">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <i data-lucide="message-square" class="w-5 h-5"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-slate-900">Kirim Kritik & Saran</h1>
                    <p class="text-xs text-slate-500 mt-0.5">Suara dan masukan Anda sangat berharga untuk kemajuan layanan Voltiva</p>
                </div>
            </div>

            <form action="{{ route('saran.store') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label for="pesan" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Pesan Masukan Anda (Minimal 10 Karakter)
                    </label>
                    <textarea id="pesan" name="pesan" rows="5" required
                        placeholder="Tuliskan pengalaman berbelanja, keluhan, saran penambahan produk, atau perbaikan layanan..."
                        class="w-full p-4 text-sm bg-slate-50 border @error('pesan') border-red-400 @else border-slate-200 @enderror rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed">{{ old('pesan') }}</textarea>
                    @error('pesan')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="btn-volt w-full py-3 text-sm font-semibold">
                    <i data-lucide="send" class="w-4 h-4"></i>
                    <span>Kirim Masukan</span>
                </button>
            </form>
        </div>

    </div>
</div>
@endsection
