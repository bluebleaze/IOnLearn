<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Halaman Form Login
    public function showLoginForm()
    {
        return view('auth.login');
    }

    // Proses Login (Tanpa Hash)
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'sandi'    => 'required',
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'sandi.required'    => 'Password wajib diisi.',
        ]);

        // Cari pengguna berdasarkan email dan password teks biasa
        $pengguna = Pengguna::where('email', trim($request->email))
                        ->where('sandi', $request->sandi)
                        ->first();

        if ($pengguna) {
            Auth::login($pengguna);
            $request->session()->regenerate();

            if ($pengguna->isAdmin()) {
                return redirect()->intended('/admin/dashboard');
            }

            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'Email atau password yang Anda masukkan salah.',
        ])->onlyInput('email');
    }

    // Halaman Form Register
    public function showRegisterForm()
    {
        return view('auth.register');
    }

    // Proses Register (Tanpa Hash)
    public function register(Request $request)
    {
        $request->validate([
            'nama_lengkap'     => 'required|string|max:255',
            'email'            => 'required|string|email|max:255|unique:tb_pengguna,email',
            'sandi'            => 'required|string|min:8|confirmed',
        ], [
            'nama_lengkap.required'     => 'Nama lengkap wajib diisi.',
            'email.required'            => 'Email wajib diisi.',
            'email.unique'              => 'Email sudah terdaftar.',
            'sandi.required'            => 'Sandi wajib diisi.',
            'sandi.min'                 => 'Sandi minimal 8 karakter.',
            'sandi.confirmed'           => 'Konfirmasi sandi tidak cocok.',
        ]);

        $pengguna = Pengguna::create([
            'nama_lengkap'     =>  trim($request->nama_lengkap),
            'email'             => strtolower(trim($request->email)),
            'sandi'             => $request->sandi,
            'peran'             => 'pengguna',
        ]);

        Auth::login($pengguna);
        $request->session()->regenerate();
        
        return redirect('/')->with('success', 'Pendaftaran berhasil!');
    }

    // Proses Logout
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Anda telah berhasil keluar.');
    }
}