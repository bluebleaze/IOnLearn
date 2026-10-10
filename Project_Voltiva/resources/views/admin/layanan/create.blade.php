@extends('layouts.admin')

@section('title', 'Tambah Layanan Baru - Voltiva Admin')
@section('header_title', 'Tambah Layanan Servis')

@section('content')
<div class="max-w-3xl space-y-6">

    <div class="flex items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold text-slate-900">Tambah Layanan Servis</h1>
            <p class="text-xs text-slate-500 mt-0.5">Lengkapi formulir untuk menambahkan paket servis atau upgrade baru</p>
        </div>
        <a href="{{ route('admin.layanan.index') }}" class="btn-volt-secondary text-xs">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali</span>
        </a>
    </div>

    <div class="card-volt p-6 bg-white">
        <form action="{{ route('admin.layanan.store') }}" method="POST" class="space-y-6">
            @csrf

            <!-- Nama Layanan -->
            <div>
                <label for="nama_layanan" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Nama Layanan <span class="text-red-500">*</span>
                </label>
                <input type="text" name="nama_layanan" id="nama_layanan" value="{{ old('nama_layanan') }}" required
                    placeholder="Contoh: Deep Cleaning & Thermal Repaste"
                    class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                @error('nama_layanan')
                    <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Kategori & Icon -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="kategori_layanan" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Kategori Layanan <span class="text-red-500">*</span>
                    </label>
                    <select name="kategori_layanan" id="kategori_layanan" required
                        class="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        @foreach($kategoriList as $kat)
                            <option value="{{ $kat }}" {{ old('kategori_layanan') == $kat ? 'selected' : '' }}>
                                {{ $kat }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label for="icon" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Icon Lucide (Pilihan)
                    </label>
                    <input type="text" name="icon" id="icon" value="{{ old('icon', 'wrench') }}"
                        placeholder="wrench, cpu, fan, laptop, monitor, activity"
                        class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>

            <!-- Deskripsi -->
            <div>
                <label for="deskripsi" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Deskripsi Lengkap <span class="text-red-500">*</span>
                </label>
                <textarea name="deskripsi" id="deskripsi" rows="3" required
                    placeholder="Jelaskan cakupan tindakan servis dan manfaat bagi pelanggan..."
                    class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">{{ old('deskripsi') }}</textarea>
                @error('deskripsi')
                    <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Estimasi, Garansi, & Biaya -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label for="estimasi_waktu" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Estimasi Waktu <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="estimasi_waktu" id="estimasi_waktu" value="{{ old('estimasi_waktu', '1 - 2 Jam') }}" required
                        placeholder="Contoh: 1 - 2 Jam"
                        class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>

                <div>
                    <label for="garansi" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Garansi <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="garansi" id="garansi" value="{{ old('garansi', '1 Bulan') }}" required
                        placeholder="Contoh: 1 Bulan"
                        class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>

                <div>
                    <label for="biaya_mulai_dari" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Biaya Mulai (Rp) <span class="text-red-500">*</span>
                    </label>
                    <input type="number" name="biaya_mulai_dari" id="biaya_mulai_dari" value="{{ old('biaya_mulai_dari', 0) }}" min="0" required
                        class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>

            <!-- Keuntungan (Poin per Baris) -->
            <div>
                <label for="keuntungan" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Keuntungan / Poin Unggulan (1 Baris per Poin)
                </label>
                <textarea name="keuntungan" id="keuntungan" rows="4"
                    placeholder="Suhu laptop turun drastis&#10;Kipas tidak bising&#10;Performa gaming kembali maksimal"
                    class="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">{{ old('keuntungan') }}</textarea>
            </div>

            <!-- Status Aktif -->
            <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Status Publikasi</label>
                <div class="flex items-center gap-6">
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="radio" name="is_aktif" value="true" {{ old('is_aktif', 'true') === 'true' ? 'checked' : '' }} class="text-blue-600 focus:ring-blue-500">
                        <span>Aktif (Tampilkan di Katalog)</span>
                    </label>
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="radio" name="is_aktif" value="false" {{ old('is_aktif') === 'false' ? 'checked' : '' }} class="text-blue-600 focus:ring-blue-500">
                        <span>Nonaktif (Sembunyikan)</span>
                    </label>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <a href="{{ route('admin.layanan.index') }}" class="btn-volt-secondary text-xs">Batal</a>
                <button type="submit" class="btn-volt text-xs">
                    <i data-lucide="check" class="w-4 h-4"></i>
                    <span>Simpan Layanan</span>
                </button>
            </div>
        </form>
    </div>

</div>
@endsection
