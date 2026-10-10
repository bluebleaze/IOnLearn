@extends('layouts.admin')

@section('title', 'Kelola Brand - Voltiva Admin')
@section('header_title', 'Kelola Brand Produk')

@section('content')
<div class="space-y-6">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold text-slate-900">Daftar Brand</h1>
            <p class="text-xs text-slate-500 mt-0.5">Kelola merek dan manufaktur produk di Voltiva</p>
        </div>
        <a href="{{ route('admin.brand.create') }}" class="btn-volt text-xs">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Tambah Brand Baru</span>
        </a>
    </div>

    <div class="card-volt overflow-hidden bg-white">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-6 w-16">No</th>
                        <th class="py-3.5 px-6">Nama Brand</th>
                        <th class="py-3.5 px-6">Slug</th>
                        <th class="py-3.5 px-6 text-center">Jumlah Produk</th>
                        <th class="py-3.5 px-6 text-right w-36">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($brands as $index => $item)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-4 px-6 text-xs text-slate-500">
                                {{ $brands->firstItem() + $index }}
                            </td>
                            <td class="py-4 px-6 font-bold text-slate-800">
                                {{ $item->nama_brand }}
                            </td>
                            <td class="py-4 px-6 text-xs text-slate-500 font-mono">
                                {{ $item->slug }}
                            </td>
                            <td class="py-4 px-6 text-center">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                    {{ $item->produk_count }} Produk
                                </span>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('admin.brand.edit', $item->id) }}" class="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Edit">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </a>
                                    <form action="{{ route('admin.brand.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Hapus brand ini?');">
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
                                Belum ada data brand terdaftar.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($brands->hasPages())
            <div class="p-4 border-t border-slate-100">
                {{ $brands->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
