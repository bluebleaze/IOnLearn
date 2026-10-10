@extends('layouts.admin')

@section('title', 'Kelola Kategori - Voltiva Admin')
@section('header_title', 'Kelola Kategori Produk')

@section('content')
<div class="space-y-6">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold text-slate-900">Daftar Kategori</h1>
            <p class="text-xs text-slate-500 mt-0.5">Kelola kategori pengelompokan produk di Voltiva</p>
        </div>
        <a href="{{ route('admin.kategori.create') }}" class="btn-volt text-xs">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Tambah Kategori Baru</span>
        </a>
    </div>

    <div class="card-volt overflow-hidden bg-white">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-6 w-16">No</th>
                        <th class="py-3.5 px-6">Nama Kategori</th>
                        <th class="py-3.5 px-6">Slug</th>
                        <th class="py-3.5 px-6 text-center">Jumlah Produk</th>
                        <th class="py-3.5 px-6 text-right w-36">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($kategori as $index => $item)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-4 px-6 text-xs text-slate-500">
                                {{ $kategori->firstItem() + $index }}
                            </td>
                            <td class="py-4 px-6 font-bold text-slate-800">
                                {{ $item->nama_kategori }}
                            </td>
                            <td class="py-4 px-6 text-xs text-slate-500 font-mono">
                                {{ $item->slug }}
                            </td>
                            <td class="py-4 px-6 text-center">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700">
                                    {{ $item->produk_count }} Produk
                                </span>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('admin.kategori.edit', $item->id) }}" class="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Edit">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </a>
                                    <form action="{{ route('admin.kategori.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Hapus kategori ini?');">
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
                            <td colspan="5" class="py-12 text-center text-slate-400 text-xs">
                                Belum ada data kategori terdaftar.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($kategori->hasPages())
            <div class="p-4 border-t border-slate-100">
                {{ $kategori->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
