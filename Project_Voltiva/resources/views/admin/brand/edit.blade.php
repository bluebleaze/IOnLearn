@extends('layouts.admin')

@section('title', 'Edit Brand - Voltiva Admin')
@section('header_title', 'Perbarui Data Brand')

@section('content')
<div class="max-w-xl mx-auto">
    <div class="card-volt p-6 sm:p-8 bg-white">
        <div class="mb-6">
            <h1 class="text-lg font-bold text-slate-900">Form Edit Brand</h1>
            <p class="text-xs text-slate-500 mt-0.5">Ubah nama brand: {{ $brand->nama_brand }}</p>
        </div>

        <form action="{{ route('admin.brand.update', $brand->id) }}" method="POST" class="space-y-4">
            @csrf
            @method('PUT')

            <div>
                <label for="nama_brand" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Nama Brand *
                </label>
                <input type="text" id="nama_brand" name="nama_brand" value="{{ old('nama_brand', $brand->nama_brand) }}" required autofocus
                    class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('nama_brand') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                @error('nama_brand')
                    <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="pt-4 flex items-center justify-end gap-3">
                <a href="{{ route('admin.brand.index') }}" class="btn-volt-secondary text-xs">
                    Batal
                </a>
                <button type="submit" class="btn-volt text-xs">
                    <i data-lucide="check" class="w-4 h-4"></i>
                    <span>Simpan Perubahan</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
