<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-slate-100 text-slate-800">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Admin Panel - Voltiva')</title>

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Vite Styles & Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-full flex font-sans antialiased">

    <!-- Admin Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
        <!-- Brand Header -->
        <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                @if(file_exists(public_path('images/logo.png')))
                    <img src="{{ asset('images/logo.png') }}" alt="Voltiva" class="w-6 h-6 object-contain">
                @else
                    <i data-lucide="zap" class="w-5 h-5 fill-current"></i>
                @endif
            </div>
            <div>
                <span class="text-base font-bold text-white tracking-tight block">VOLTIVA</span>
                <span class="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block -mt-1">Admin Panel</span>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Utama</div>
            
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.dashboard') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>

            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-5 mb-2">Katalog & Produk</div>

            <a href="{{ route('admin.kategori.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.kategori.*') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="tag" class="w-4 h-4"></i>
                <span>Kategori</span>
            </a>

            <a href="{{ route('admin.brand.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.brand.*') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="badge-check" class="w-4 h-4"></i>
                <span>Brand</span>
            </a>

            <a href="{{ route('admin.produk.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.produk.*') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="package" class="w-4 h-4"></i>
                <span>Produk</span>
            </a>

            <a href="{{ route('admin.layanan.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.layanan.*') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="wrench" class="w-4 h-4"></i>
                <span>Layanan Servis</span>
            </a>

            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-5 mb-2">Transaksi & Interaksi</div>

            <a href="{{ route('admin.pesanan.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.pesanan.*') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                <span>Pesanan Masuk</span>
            </a>

            <a href="{{ route('admin.saran.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {{ request()->routeIs('admin.saran.*') ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80' }}">
                <i data-lucide="message-square" class="w-4 h-4"></i>
                <span>Kritik & Saran</span>
            </a>
        </nav>

        <!-- Bottom Actions -->
        <div class="p-4 border-t border-slate-800 space-y-2">
            <a href="{{ route('home') }}" class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-blue-400 rounded-xl hover:bg-slate-800 transition-colors">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>Ke Halaman Toko</span>
            </a>
            <form action="{{ route('logout') }}" method="POST">
                @csrf
                <button type="submit" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-colors">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                    <span>Keluar Sistem</span>
                </button>
            </form>
        </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        <!-- Topbar -->
        <header class="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
            <div>
                <h2 class="text-base sm:text-lg font-bold text-slate-900">
                    @yield('header_title', 'Dashboard')
                </h2>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div class="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {{ strtoupper(substr(Auth::user()->nama_lengkap ?? 'A', 0, 1)) }}
                    </div>
                    <div class="hidden sm:block text-left text-xs">
                        <span class="font-bold text-slate-800 block">{{ Auth::user()->nama_lengkap ?? 'Administrator' }}</span>
                        <span class="text-slate-500 capitalize">{{ Auth::user()->peran ?? 'Admin' }}</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-6 sm:p-8">
            <!-- Flash Alerts -->
            @if(session('success'))
                <div class="flex items-center gap-3 p-4 mb-6 text-sm text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-200" role="alert">
                    <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 shrink-0"></i>
                    <div class="font-medium">{{ session('success') }}</div>
                </div>
            @endif

            @if(session('error'))
                <div class="flex items-center gap-3 p-4 mb-6 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-200" role="alert">
                    <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 shrink-0"></i>
                    <div class="font-medium">{{ session('error') }}</div>
                </div>
            @endif

            @if(session('warning'))
                <div class="flex items-center gap-3 p-4 mb-6 text-sm text-amber-800 rounded-2xl bg-amber-50 border border-amber-200" role="alert">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 shrink-0"></i>
                    <div class="font-medium">{{ session('warning') }}</div>
                </div>
            @endif

            @yield('content')
        </main>

    </div>

    <!-- Script Init -->
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    </script>
</body>
</html>
