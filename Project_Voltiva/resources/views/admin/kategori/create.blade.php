@extends('layouts.admin')

@section('title', 'Tambah Kategori - Voltiva Admin')
@section('header_title', 'Tambah Kategori Baru')

@section('content')
<div class="max-w-xl mx-auto">
    <div class="card-volt p-6 sm:p-8 bg-white">
        <div class="mb-6">
            <h1 class="text-lg font-bold text-slate-900">Form Tambah Kategori</h1>
            <p class="text-xs text-slate-500 mt-0.5">Masukkan nama kelompok produk yang ingin ditambahkan</p>
        </div>

        <form action="{{ route('admin.kategori.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label for="nama_kategori" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Nama Kategori *
                </label>
                <input type="text" id="nama_kategori" name="nama_kategori" value="{{ old('nama_kategori') }}" required autofocus
                    placeholder="Contoh: Laptop Gaming, Motherboard, GPU, Peripheral"
                    class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('nama_kategori') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                @error('nama_kategori')
                    <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="pt-4 flex items-center justify-end gap-3">
                <a href="{{ route('admin.kategori.index') }}" class="btn-volt-secondary text-xs">
                    Batal
                </a>
                <button type="submit" class="btn-volt text-xs">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    <span>Simpan Kategori</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
