@extends('layouts.admin')

@section('title', 'Detail Kritik & Saran - Voltiva Admin')
@section('header_title', 'Rincian Pesan Masukan')

@section('content')
<div class="max-w-2xl mx-auto space-y-6">
    
    <div class="flex items-center justify-between">
        <a href="{{ route('admin.saran.index') }}" class="btn-volt-secondary text-xs">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Kotak Masuk</span>
        </a>

        <form action="{{ route('admin.saran.destroy', $saran->id) }}" method="POST" onsubmit="return confirm('Hapus pesan ini?');">
            @csrf
            @method('DELETE')
            <button type="submit" class="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200">
                <i data-lucide="trash-2" class="w-3.5 h-3.5 inline mr-1"></i>
                Hapus Pesan
            </button>
        </form>
    </div>

    <div class="card-volt p-6 sm:p-8 bg-white">
        <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                {{ strtoupper(substr($saran->pengguna->nama_lengkap ?? 'U', 0, 1)) }}
            </div>
            <div>
                <h2 class="text-base font-bold text-slate-900">{{ $saran->pengguna->nama_lengkap ?? 'Pengguna Anonim' }}</h2>
                <p class="text-xs text-slate-500">{{ $saran->pengguna->email ?? '-' }} &bull; {{ $saran->created_at->format('d F Y, H:i') }} WIB</p>
            </div>
        </div>

        <div class="py-6">
            <span class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Isi Pesan Masukan:</span>
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {{ $saran->pesan }}
            </div>
        </div>
    </div>

</div>
@endsection
