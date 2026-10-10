@extends('layouts.admin')

@section('title', 'Kelola Produk - Voltiva Admin')
@section('header_title', 'Kelola Produk & Inventaris')

@section('content')
<div class="space-y-6">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold text-slate-900">Daftar Produk</h1>
            <p class="text-xs text-slate-500 mt-0.5">Kelola stok, harga, dan ketersediaan hardware di katalog</p>
        </div>
        <a href="{{ route('admin.produk.create') }}" class="btn-volt text-xs">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Tambah Produk Baru</span>
        </a>
    </div>

    <div class="card-volt overflow-hidden bg-white">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-6 w-16">No</th>
                        <th class="py-3.5 px-6">Produk</th>
                        <th class="py-3.5 px-6">Kategori & Brand</th>
                        <th class="py-3.5 px-6">Harga</th>
                        <th class="py-3.5 px-6 text-center">Stok</th>
                        <th class="py-3.5 px-6 text-center">Status</th>
                        <th class="py-3.5 px-6 text-right w-36">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($produk as $index => $item)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-4 px-6 text-xs text-slate-500">
                                {{ $produk->firstItem() + $index }}
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                        @if($item->gambar && file_exists(public_path('storage/' . $item->gambar)))
                                            <img src="{{ asset('storage/' . $item->gambar) }}" alt="{{ $item->nama_produk }}" class="w-full h-full object-cover">
                                        @else
                                            <i data-lucide="laptop" class="w-5 h-5 text-slate-300"></i>
                                        @endif
                                    </div>
                                    <div class="max-w-xs">
                                        <p class="font-bold text-slate-900 line-clamp-1">{{ $item->nama_produk }}</p>
                                        <p class="text-xs text-slate-500 line-clamp-1 mt-0.5">{{ $item->deskripsi_produk }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6 text-xs">
                                <span class="font-semibold text-slate-800 block">{{ $item->kategori->nama_kategori ?? '-' }}</span>
                                <span class="text-blue-600 font-bold uppercase tracking-wider block mt-0.5">{{ $item->brand->nama_brand ?? '-' }}</span>
                            </td>
                            <td class="py-4 px-6 font-bold text-blue-600 text-xs">
                                Rp {{ number_format($item->harga, 0, ',', '.') }}
                            </td>
                            <td class="py-4 px-6 text-center text-xs">
                                <span class="px-2 py-0.5 rounded-full font-semibold {{ $item->stok > 0 ? 'bg-slate-100 text-slate-800' : 'bg-red-100 text-red-700' }}">
                                    {{ $item->stok }} unit
                                </span>
                            </td>
                            <td class="py-4 px-6 text-center">
                                @if($item->is_aktif)
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        Aktif
                                    </span>
                                @else
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                                        Nonaktif
                                    </span>
                                @endif
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('katalog.show', $item->id) }}" target="_blank" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Lihat di Toko">
                                        <i data-lucide="external-link" class="w-4 h-4"></i>
                                    </a>
                                    <a href="{{ route('admin.produk.edit', $item->id) }}" class="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Edit">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </a>
                                    <form action="{{ route('admin.produk.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Hapus/nonaktifkan produk ini?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                                Belum ada data produk terdaftar.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($produk->hasPages())
            <div class="p-4 border-t border-slate-100">
                {{ $produk->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
