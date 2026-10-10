@extends('layouts.main')

@section('title', 'Riwayat Pesanan Saya - Voltiva')

@section('content')
<div class="py-10 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <a href="{{ route('home') }}" class="hover:text-blue-600 transition-colors">Beranda</a>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="text-slate-800 font-medium">Pesanan Saya</span>
        </nav>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Riwayat Pesanan</h1>

        @if($pesanan->count() > 0)
            <div class="space-y-4">
                @foreach($pesanan as $item)
                    <div class="card-volt p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="space-y-2">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="text-xs font-bold text-slate-800">#ORD-{{ str_pad($item->id, 5, '0', STR_PAD_LEFT) }}</span>
                                <span class="text-xs text-slate-400">&bull;</span>
                                <span class="text-xs text-slate-500">{{ $item->created_at->format('d M Y, H:i') }}</span>
                                
                                <!-- Status Pembayaran Badge -->
                                @if($item->status_pembayaran === 'selesai')
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        Lunas
                                    </span>
                                @elseif($item->status_pembayaran === 'dibatalkan')
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        Dibatalkan
                                    </span>
                                @else
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                        {{ ucfirst($item->status_pembayaran) }}
                                    </span>
                                @endif

                                <!-- Status Pengiriman Badge -->
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    Pengiriman: {{ ucfirst($item->status_pengiriman) }}
                                </span>
                            </div>

                            <div class="text-xs text-slate-600">
                                Total item: <span class="font-semibold text-slate-800">{{ $item->detail_pesanan_count ?? 'Item' }} item</span>
                            </div>

                            <div class="text-base font-extrabold text-blue-600">
                                Rp {{ number_format($item->total_harga, 0, ',', '.') }}
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-3 self-end sm:self-center">
                            @if($item->status_pembayaran === 'pending')
                                <form action="{{ route('pesanan.batalkan', $item->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin membatalkan pesanan ini?');">
                                    @csrf
                                    <button type="submit" class="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                        Batalkan
                                    </button>
                                </form>
                            @endif

                            <a href="{{ route('pesanan.show', $item->id) }}" class="btn-volt py-2 px-4 text-xs font-semibold">
                                <span>Rincian Pesanan</span>
                                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                            </a>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-8 flex justify-center">
                {{ $pesanan->links() }}
            </div>
        @else
            <div class="card-volt text-center py-20 p-8 max-w-lg mx-auto">
                <i data-lucide="package" class="w-16 h-16 text-slate-300 mx-auto mb-4"></i>
                <h2 class="text-lg font-bold text-slate-800">Belum Ada Riwayat Pesanan</h2>
                <p class="text-xs text-slate-500 mt-1 mb-6">Anda belum pernah melakukan pemesanan di Voltiva.</p>
                <a href="{{ route('katalog.index') }}" class="btn-volt">
                    <span>Mulai Belanja</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>
            </div>
        @endif

    </div>
</div>
@endsection
