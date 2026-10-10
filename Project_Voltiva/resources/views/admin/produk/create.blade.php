@extends('layouts.admin')

@section('title', 'Tambah Produk - Voltiva Admin')
@section('header_title', 'Tambah Produk Baru')

@section('content')
<div class="max-w-3xl mx-auto">
    <div class="card-volt p-6 sm:p-8 bg-white">
        <div class="mb-6">
            <h1 class="text-lg font-bold text-slate-900">Form Tambah Produk Baru</h1>
            <p class="text-xs text-slate-500 mt-0.5">Lengkapi spesifikasi hardware dan informasi produk</p>
        </div>

        <form action="{{ route('admin.produk.store') }}" method="POST" enctype="multipart/form-data" class="space-y-5">
            @csrf

            <!-- Nama Produk -->
            <div>
                <label for="nama_produk" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Nama Produk *
                </label>
                <input type="text" id="nama_produk" name="nama_produk" value="{{ old('nama_produk') }}" required
                    placeholder="Contoh: Laptop ROG Zephyrus G14 OLED"
                    class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('nama_produk') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                @error('nama_produk')
                    <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Kategori & Brand Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="kategori_id" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Kategori *
                    </label>
                    <select id="kategori_id" name="kategori_id" required
                        class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('kategori_id') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Pilih Kategori</option>
                        @foreach($kategori as $kat)
                            <option value="{{ $kat->id }}" {{ old('kategori_id') == $kat->id ? 'selected' : '' }}>
                                {{ $kat->nama_kategori }}
                            </option>
                        @endforeach
                    </select>
                    @error('kategori_id')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="brand_id" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Brand / Manufaktur *
                    </label>
                    <select id="brand_id" name="brand_id" required
                        class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('brand_id') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Pilih Brand</option>
                        @foreach($brand as $b)
                            <option value="{{ $b->id }}" {{ old('brand_id') == $b->id ? 'selected' : '' }}>
                                {{ $b->nama_brand }}
                            </option>
                        @endforeach
                    </select>
                    @error('brand_id')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Harga & Stok Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="harga" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Harga (Rp) *
                    </label>
                    <input type="number" id="harga" name="harga" value="{{ old('harga') }}" required min="0"
                        placeholder="Contoh: 25000000"
                        class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('harga') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    @error('harga')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="stok" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Jumlah Stok *
                    </label>
                    <input type="number" id="stok" name="stok" value="{{ old('stok', 1) }}" required min="0"
                        class="w-full px-4 py-2.5 text-sm bg-slate-50 border @error('stok') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    @error('stok')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Deskripsi -->
            <div>
                <label for="deskripsi_produk" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Deskripsi & Spesifikasi Produk *
                </label>
                <textarea id="deskripsi_produk" name="deskripsi_produk" rows="5" required
                    placeholder="Tuliskan spesifikasi detail seperti processor, RAM, penyimpanan, garansi..."
                    class="w-full p-4 text-sm bg-slate-50 border @error('deskripsi_produk') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed">{{ old('deskripsi_produk') }}</textarea>
                @error('deskripsi_produk')
                    <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Gambar Upload -->
            <div>
                <label for="gambar" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Foto / Gambar Produk (JPG, PNG, WebP maks 2MB) *
                </label>
                <input type="file" id="gambar" name="gambar" required accept="image/*"
                    class="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50">
                @error('gambar')
                    <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Actions -->
            <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <a href="{{ route('admin.produk.index') }}" class="btn-volt-secondary text-xs">
                    Batal
                </a>
                <button type="submit" class="btn-volt text-xs">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    <span>Simpan Produk</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
