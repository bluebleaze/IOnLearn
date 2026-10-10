@extends('layouts.admin')

@section('title', 'Kelola Pesanan - Voltiva Admin')
@section('header_title', 'Kelola Pesanan Pelanggan')

@section('content')
<div class="space-y-6">
    
    <div>
        <h1 class="text-xl font-bold text-slate-900">Daftar Transaksi Pesanan</h1>
        <p class="text-xs text-slate-500 mt-0.5">Pantau status pembayaran dan proses pengiriman barang pesanan</p>
    </div>

    <div class="card-volt overflow-hidden bg-white">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-6">ID Pesanan</th>
                        <th class="py-3.5 px-6">Pelanggan</th>
                        <th class="py-3.5 px-6">Tanggal</th>
                        <th class="py-3.5 px-6">Total Tagihan</th>
                        <th class="py-3.5 px-6 text-center">Status Pembayaran</th>
                        <th class="py-3.5 px-6 text-center">Status Pengiriman</th>
                        <th class="py-3.5 px-6 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($pesanan as $item)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-4 px-6 text-xs font-bold text-slate-800">
                                #ORD-{{ str_pad($item->id, 5, '0', STR_PAD_LEFT) }}
                            </td>
                            <td class="py-4 px-6 text-xs">
                                <span class="font-bold text-slate-800 block">{{ $item->pengguna->nama_lengkap ?? 'User Dihapus' }}</span>
                                <span class="text-slate-500 block">{{ $item->pengguna->email ?? '-' }}</span>
                            </td>
                            <td class="py-4 px-6 text-xs text-slate-500">
                                {{ $item->created_at->format('d M Y, H:i') }}
                            </td>
                            <td class="py-4 px-6 text-xs font-bold text-blue-600">
                                Rp {{ number_format($item->total_harga, 0, ',', '.') }}
                            </td>
                            <td class="py-4 px-6 text-center">
                                @if($item->status_pembayaran === 'selesai')
                                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        Lunas
                                    </span>
                                @elseif($item->status_pembayaran === 'dibatalkan')
                                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        Dibatalkan
                                    </span>
                                @else
                                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                        {{ ucfirst($item->status_pembayaran) }}
                                    </span>
                                @endif
                            </td>
                            <td class="py-4 px-6 text-center">
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                    {{ $item->status_pengiriman }}
                                </span>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <a href="{{ route('admin.pesanan.show', $item->id) }}" class="btn-volt py-1.5 px-3 text-xs">
                                    <span>Kelola</span>
                                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                                Belum ada transaksi pesanan masuk.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($pesanan->hasPages())
            <div class="p-4 border-t border-slate-100">
                {{ $pesanan->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
