@extends('layouts.admin')

@section('title', 'Kelola Layanan Servis - Voltiva Admin')
@section('header_title', 'Kelola Layanan Servis & Upgrade')

@section('content')
<div class="space-y-6">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold text-slate-900">Daftar Layanan Servis</h1>
            <p class="text-xs text-slate-500 mt-0.5">Kelola layanan servis, maintenance, dan upgrade laptop</p>
        </div>
        <a href="{{ route('admin.layanan.create') }}" class="btn-volt text-xs">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Tambah Layanan Baru</span>
        </a>
    </div>

    <div class="card-volt overflow-hidden bg-white">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-6 w-16">No</th>
                        <th class="py-3.5 px-6">Nama Layanan</th>
                        <th class="py-3.5 px-6">Kategori</th>
                        <th class="py-3.5 px-6">Estimasi & Garansi</th>
                        <th class="py-3.5 px-6">Biaya Mulai</th>
                        <th class="py-3.5 px-6 text-center">Status</th>
                        <th class="py-3.5 px-6 text-right w-36">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($layanan as $index => $item)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-4 px-6 text-xs text-slate-500">
                                {{ $layanan->firstItem() + $index }}
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <i data-lucide="{{ $item->icon ?: 'wrench' }}" class="w-4 h-4"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-slate-900">{{ $item->nama_layanan }}</div>
                                        <div class="text-[11px] text-slate-400 font-mono">{{ $item->slug }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700">
                                    {{ $item->kategori_layanan }}
                                </span>
                            </td>
                            <td class="py-4 px-6 text-xs text-slate-600">
                                <div><span class="text-slate-400">Durasi:</span> {{ $item->estimasi_waktu }}</div>
                                <div><span class="text-slate-400">Garansi:</span> {{ $item->garansi }}</div>
                            </td>
                            <td class="py-4 px-6 font-bold text-slate-900 text-xs">
                                @if($item->biaya_mulai_dari <= 0)
                                    <span class="text-emerald-600">GRATIS</span>
                                @else
                                    Rp {{ number_format($item->biaya_mulai_dari, 0, ',', '.') }}
                                @endif
                            </td>
                            <td class="py-4 px-6 text-center">
                                @if($item->is_aktif === 'true')
                                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Aktif</span>
                                @else
                                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">Nonaktif</span>
                                @endif
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('layanan.show', $item->slug) }}" target="_blank" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Lihat Publik">
                                        <i data-lucide="external-link" class="w-4 h-4"></i>
                                    </a>
                                    <a href="{{ route('admin.layanan.edit', $item->id) }}" class="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Edit">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </a>
                                    <form action="{{ route('admin.layanan.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Hapus layanan ini?');">
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
                            <td colspan="7" class="py-12 text-center text-slate-500">
                                <i data-lucide="wrench" class="w-10 h-10 text-slate-300 mx-auto mb-2"></i>
                                <p class="text-sm font-medium">Belum ada layanan servis.</p>
                                <a href="{{ route('admin.layanan.create') }}" class="text-xs text-blue-600 hover:underline mt-1 inline-block">Tambah layanan pertama</a>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($layanan->hasPages())
            <div class="p-4 border-t border-slate-100">
                {{ $layanan->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
