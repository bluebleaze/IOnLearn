@extends('layouts.main')

@section('title', 'Daftar Akun Baru - Voltiva')

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
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Bergabung dengan Voltiva</h2>
            <p class="text-xs text-slate-500 mt-1">Buat akun untuk mulai berbelanja produk teknologi bergaransi resmi</p>
        </div>

        <!-- Form Card -->
        <div class="card-volt p-6 sm:p-8 bg-white shadow-xl shadow-slate-200/50">
            <form action="{{ route('register') }}" method="POST" class="space-y-4">
                @csrf

                <!-- Nama Lengkap Input -->
                <div>
                    <label for="nama_lengkap" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap
                    </label>
                    <div class="relative">
                        <input type="text" id="nama_lengkap" name="nama_lengkap" value="{{ old('nama_lengkap') }}" required autofocus
                            placeholder="Contoh: John Doe"
                            class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border @error('nama_lengkap') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <i data-lucide="user" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    </div>
                    @error('nama_lengkap')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email
                    </label>
                    <div class="relative">
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required
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
                    <label for="sandi" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kata Sandi
                    </label>
                    <div class="relative">
                        <input type="password" id="sandi" name="sandi" required
                            placeholder="Minimal 8 karakter"
                            class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border @error('sandi') border-red-400 @else border-slate-200 @enderror rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    </div>
                    @error('sandi')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Konfirmasi Sandi Input -->
                <div>
                    <label for="sandi_confirmation" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Konfirmasi Kata Sandi
                    </label>
                    <div class="relative">
                        <input type="password" id="sandi_confirmation" name="sandi_confirmation" required
                            placeholder="Ulangi kata sandi"
                            class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <i data-lucide="shield-check" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn-volt w-full py-3 text-sm font-semibold tracking-wide mt-3">
                    <i data-lucide="user-plus" class="w-4 h-4"></i>
                    <span>Daftar Akun</span>
                </button>
            </form>

            <div class="mt-6 text-center text-xs text-slate-500">
                Sudah memiliki akun?
                <a href="{{ route('login') }}" class="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Masuk di sini
                </a>
            </div>
        </div>

    </div>
</div>
@endsection
