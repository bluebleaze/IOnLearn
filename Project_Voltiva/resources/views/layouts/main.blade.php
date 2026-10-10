<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-slate-50 text-slate-800">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Voltiva - Gadget & Tech Store')</title>

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Vite Styles & Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-full flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">

    <!-- Header / Navbar -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 gap-4">
                
                <!-- Logo & Brand -->
                <div class="flex items-center gap-8">
                    <a href="{{ route('home') }}" class="flex items-center gap-3 group">
                        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                            @if(file_exists(public_path('images/logo.png')))
                                <img src="{{ asset('images/logo.png') }}" alt="Voltiva" class="w-7 h-7 object-contain">
                            @else
                                <i data-lucide="zap" class="w-6 h-6 fill-current"></i>
                            @endif
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                                VOLTIVA
                            </span>
                            <span class="text-[10px] tracking-wider font-semibold text-slate-600 uppercase -mt-1">
                                Tech & Performance
                            </span>
                        </div>
                    </a>

                    <!-- Navigation Links (Desktop) -->
                    <nav class="hidden md:flex items-center gap-1">
                        <a href="{{ route('home') }}" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('home') ? 'text-blue-600 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70' }}">
                            Beranda
                        </a>
                        <a href="{{ route('katalog.index') }}" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('katalog.*') ? 'text-blue-600 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70' }}">
                            Katalog Produk
                        </a>
                        <a href="{{ route('layanan.index') }}" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('layanan.*') ? 'text-blue-600 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70' }}">
                            Layanan Servis
                        </a>
                        <a href="{{ route('saran.create') }}" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('saran.*') ? 'text-blue-600 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70' }}">
                            Kritik & Saran
                        </a>
                    </nav>
                </div>

                <!-- Search Bar (Desktop) -->
                <div class="hidden lg:flex flex-1 max-w-md mx-4">
                    <form action="{{ route('katalog.index') }}" method="GET" class="w-full relative">
                        <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari laptop, peripheral, aksesoris..." 
                            class="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200">
                        <i data-lucide="search" class="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    </form>
                </div>

                <!-- Right Actions: Cart & Auth -->
                <div class="flex items-center gap-3">
                    @auth
                        <!-- Keranjang Belanja -->
                        <a href="{{ route('keranjang.index') }}" class="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors duration-200" title="Keranjang Belanja">
                            <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                            @php
                                $totalItemKeranjang = \App\Models\Keranjang::where('pengguna_id', Auth::id())->sum('jumlah');
                            @endphp
                            @if($totalItemKeranjang > 0)
                                <span class="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-blue-600 rounded-full border-2 border-white shadow-xs">
                                    {{ $totalItemKeranjang > 99 ? '99+' : $totalItemKeranjang }}
                                </span>
                            @endif
                        </a>

                        <!-- User Profile Dropdown -->
                        <div class="relative" id="user-menu-container">
                            <button id="user-menu-button" type="button" class="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 focus:outline-none">
                                <div class="text-left hidden sm:block">
                                    <div class="text-xs font-semibold text-slate-800 leading-tight">
                                        {{ Str::limit(Auth::user()->nama_lengkap, 16) }}
                                    </div>
                                    <div class="text-[10px] text-slate-600 capitalize">
                                        {{ Auth::user()->peran }}
                                    </div>
                                </div>
                                <div class="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-200">
                                    {{ strtoupper(substr(Auth::user()->nama_lengkap, 0, 1)) }}
                                </div>
                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-600"></i>
                            </button>

                            <!-- Dropdown Menu Content -->
                            <div id="user-menu-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                                <div class="px-4 py-2 border-b border-slate-100">
                                    <p class="text-xs text-slate-600">Masuk sebagai</p>
                                    <p class="text-sm font-semibold text-slate-800 truncate">{{ Auth::user()->email }}</p>
                                </div>

                                @if(Auth::user()->isAdmin())
                                    <div class="py-1">
                                        <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                                            <i data-lucide="layout-dashboard" class="w-4 h-4 text-blue-600"></i>
                                            <span>Dashboard Admin</span>
                                        </a>
                                    </div>
                                    <div class="border-t border-slate-100"></div>
                                @endif

                                <div class="py-1">
                                    <a href="{{ route('pesanan.index') }}" class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                                        <i data-lucide="package" class="w-4 h-4 text-slate-600"></i>
                                        <span>Pesanan Saya</span>
                                    </a>
                                    <a href="{{ route('keranjang.index') }}" class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                                        <i data-lucide="shopping-cart" class="w-4 h-4 text-slate-600"></i>
                                        <span>Keranjang</span>
                                    </a>
                                    <a href="{{ route('saran.create') }}" class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                                        <i data-lucide="message-square" class="w-4 h-4 text-slate-600"></i>
                                        <span>Kritik & Saran</span>
                                    </a>
                                </div>

                                <div class="border-t border-slate-100 pt-1">
                                    <form action="{{ route('logout') }}" method="POST">
                                        @csrf
                                        <button type="submit" class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                            <i data-lucide="log-out" class="w-4 h-4"></i>
                                            <span>Keluar</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    @else
                        <!-- Guest Buttons -->
                        <div class="flex items-center gap-2">
                            <a href="{{ route('login') }}" class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all duration-200">
                                Masuk
                            </a>
                            <a href="{{ route('register') }}" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all duration-200">
                                Daftar
                            </a>
                        </div>
                    @endauth

                    <!-- Mobile Menu Button -->
                    <button type="button" id="mobile-menu-btn" class="md:hidden p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu Dropdown -->
            <div id="mobile-menu" class="hidden md:hidden py-4 border-t border-slate-200 space-y-2">
                <form action="{{ route('katalog.index') }}" method="GET" class="relative mb-3">
                    <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari produk..." 
                        class="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <i data-lucide="search" class="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2"></i>
                </form>
                <a href="{{ route('home') }}" class="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-100">Beranda</a>
                <a href="{{ route('katalog.index') }}" class="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-100">Katalog Produk</a>
                <a href="{{ route('layanan.index') }}" class="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-100">Layanan Servis</a>
                <a href="{{ route('saran.create') }}" class="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-100">Kritik & Saran</a>
            </div>
        </div>
    </header>

    <!-- Flash Notifications / Alerts -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        @if(session('success'))
            <div class="flex items-center gap-3 p-4 mb-4 text-sm text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs" role="alert">
                <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 shrink-0"></i>
                <div class="font-medium">{{ session('success') }}</div>
            </div>
        @endif

        @if(session('error'))
            <div class="flex items-center gap-3 p-4 mb-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-200/80 shadow-xs" role="alert">
                <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 shrink-0"></i>
                <div class="font-medium">{{ session('error') }}</div>
            </div>
        @endif

        @if(session('warning'))
            <div class="flex items-center gap-3 p-4 mb-4 text-sm text-amber-800 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs" role="alert">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 shrink-0"></i>
                <div class="font-medium">{{ session('warning') }}</div>
            </div>
        @endif

        @if($errors->any())
            <div class="p-4 mb-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-200/80 shadow-xs" role="alert">
                <div class="flex items-center gap-2 font-semibold mb-1">
                    <i data-lucide="alert-octagon" class="w-5 h-5 text-red-600"></i>
                    <span>Terdapat beberapa kesalahan:</span>
                </div>
                <ul class="list-disc list-inside text-red-700 space-y-1 pl-5">
                    @foreach($errors->all() as $err)
                        <li>{{ $err }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>

    <!-- Main Content Slot -->
    <main class="flex-1">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <!-- Brand Info -->
                <div class="md:col-span-2 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                            @if(file_exists(public_path('images/logo.png')))
                                <img src="{{ asset('images/logo.png') }}" alt="Voltiva" class="w-6 h-6 object-contain">
                            @else
                                <i data-lucide="zap" class="w-5 h-5 fill-current"></i>
                            @endif
                        </div>
                        <span class="text-xl font-bold tracking-tight text-white">VOLTIVA</span>
                    </div>
                    <p class="text-sm text-slate-400 max-w-md leading-relaxed">
                        Voltiva adalah destinasi utama untuk perangkat keras performa tinggi, laptop premium, dan periferal pilihan dengan jaminan orisinalitas 100% dan garansi resmi.
                    </p>
                    <div class="flex items-center gap-3 pt-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-blue-400 border border-slate-700">
                            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> 100% Original
                        </span>
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                            <i data-lucide="truck" class="w-3.5 h-3.5"></i> Cepat & Aman
                        </span>
                    </div>
                </div>

                <!-- Quick Links -->
                <div>
                    <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigasi</h3>
                    <ul class="space-y-2.5 text-sm">
                        <li><a href="{{ route('home') }}" class="hover:text-blue-400 transition-colors">Beranda</a></li>
                        <li><a href="{{ route('katalog.index') }}" class="hover:text-blue-400 transition-colors">Katalog Produk</a></li>
                        <li><a href="{{ route('layanan.index') }}" class="hover:text-blue-400 transition-colors">Layanan Servis & Upgrade</a></li>
                        <li><a href="{{ route('saran.create') }}" class="hover:text-blue-400 transition-colors">Kritik & Masukan</a></li>
                        @auth
                            <li><a href="{{ route('pesanan.index') }}" class="hover:text-blue-400 transition-colors">Pesanan Saya</a></li>
                        @else
                            <li><a href="{{ route('login') }}" class="hover:text-blue-400 transition-colors">Masuk Akun</a></li>
                        @endauth
                    </ul>
                </div>

                <!-- Customer Support & Info -->
                <div>
                    <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Bantuan & Layanan</h3>
                    <ul class="space-y-2.5 text-sm text-slate-400">
                        <li class="flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-4 h-4 text-blue-500"></i>
                            <span>Jakarta, Indonesia</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i data-lucide="mail" class="w-4 h-4 text-blue-500"></i>
                            <span>support@voltiva.id</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i data-lucide="phone" class="w-4 h-4 text-blue-500"></i>
                            <span>+62 812-3456-7890</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                <p>&copy; {{ date('Y') }} Project Voltiva. Hak cipta dilindungi undang-undang.</p>
                <p class="flex items-center gap-1">
                    Ditenagai dengan <span class="text-blue-400 font-semibold">Laravel & Tailwind CSS</span>
                </p>
            </div>
        </div>
    </footer>

    <!-- Interactive Scripts -->
    <script>
        // Init Lucide Icons
        document.addEventListener('DOMContentLoaded', function () {
            if (window.lucide) {
                lucide.createIcons();
            }

            // User dropdown toggle
            const userBtn = document.getElementById('user-menu-button');
            const userMenu = document.getElementById('user-menu-dropdown');
            if (userBtn && userMenu) {
                userBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    userMenu.classList.toggle('hidden');
                });

                document.addEventListener('click', function (e) {
                    if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
                        userMenu.classList.add('hidden');
                    }
                });
            }

            // Mobile menu toggle
            const mobileBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileBtn && mobileMenu) {
                mobileBtn.addEventListener('click', function () {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        });
    </script>
</body>
</html>
