@extends('layouts.admin')

@section('title', 'Kritik & Saran Masuk - Voltiva Admin')
@section('header_title', 'Kotak Kritik & Saran')

@section('content')
<div class="space-y-6">
    
    <div>
        <h1 class="text-xl font-bold text-slate-900">Pesan Kritik & Saran Pelanggan</h1>
        <p class="text-xs text-slate-500 mt-0.5">Daftar ulasan, masukan, dan keluhan yang dikirimkan oleh pengguna</p>
    </div>

    <div class="card-volt overflow-hidden bg-white">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-6 w-16">Status</th>
                        <th class="py-3.5 px-6">Pengirim</th>
                        <th class="py-3.5 px-6">Cuplikan Pesan</th>
                        <th class="py-3.5 px-6">Tanggal</th>
                        <th class="py-3.5 px-6 text-right w-36">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($saran as $item)
                        <tr class="hover:bg-slate-50/80 transition-colors {{ !$item->is_dibaca ? 'bg-blue-50/30' : '' }}">
                            <td class="py-4 px-6 text-xs">
                                @if(!$item->is_dibaca)
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                        Baru
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                        Dibaca
                                    </span>
                                @endif
                            </td>
                            <td class="py-4 px-6 text-xs">
                                <span class="font-bold text-slate-800 block">{{ $item->pengguna->nama_lengkap ?? 'Anonim' }}</span>
                                <span class="text-slate-500">{{ $item->pengguna->email ?? '-' }}</span>
                            </td>
                            <td class="py-4 px-6 text-xs text-slate-600 max-w-md">
                                <a href="{{ route('admin.saran.show', $item->id) }}" class="hover:text-blue-600 line-clamp-2">
                                    {{ $item->pesan }}
                                </a>
                            </td>
                            <td class="py-4 px-6 text-xs text-slate-500">
                                {{ $item->created_at->format('d M Y, H:i') }}
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('admin.saran.show', $item->id) }}" class="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg" title="Baca Detail">
                                        <i data-lucide="eye" class="w-4 h-4"></i>
                                    </a>
                                    <form action="{{ route('admin.saran.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Hapus pesan saran ini?');">
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
                                Belum ada pesan saran atau masukan yang masuk.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($saran->hasPages())
            <div class="p-4 border-t border-slate-100">
                {{ $saran->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
