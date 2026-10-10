@extends('layouts.main')

@section('title', 'Masuk ke Akun Anda - Voltiva')

@section('content')
<div class="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-md w-full">
        
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20 mb-4">
                @if(file_exists(public_path('images/logo.png')))
                    <img src="{{ asset('images/logo.png') }}" alt="Voltiva" class="w-8 h-8 object-contain">
                @else
                    <i data-lucide="zap" class="w-7 h-7 fill-current"></i>
                @endif
            </div>
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
            <p class="text-xs text-slate-500 mt-1">Masuk untuk mengelola keranjang, pesanan, dan akun Voltiva Anda</p>
        </div>

        <!-- Form Card -->
        <div class="card-volt p-6 sm:p-8 bg-white shadow-xl shadow-slate-200/50">
            <form action="{{ route('login') }}" method="POST" class="space-y-5">
                @csrf

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email
                    </label>
                    <div class="relative">
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                            placeholder="nama@domain.com"
                            class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border @error('email') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    </div>
                    @error('email')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Sandi Input -->
                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <label for="sandi" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Kata Sandi
                        </label>
                    </div>
                    <div class="relative">
                        <input type="password" id="sandi" name="sandi" required
                            placeholder="Masukkan kata sandi"
                            class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border @error('sandi') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    </div>
                    @error('sandi')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn-volt w-full py-3 text-sm font-semibold tracking-wide mt-2">
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    <span>Masuk Sekarang</span>
                </button>
            </form>

            <div class="mt-6 text-center text-xs text-slate-500">
                Belum memiliki akun Voltiva?
                <a href="{{ route('register') }}" class="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Daftar Sekarang
                </a>
            </div>
        </div>

    </div>
</div>
@endsection
