<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Cek dulu apakah user sudah login
        if (Auth::check()) {
            /** @var \App\Models\Pengguna $user */
            $user = Auth::user();

            // 2. Cek apakah user adalah Admin
            if ($user->isAdmin()) {
                return $next($request);
            }

            // Jika login tapi BUKAN Admin -> lempar ke home
            return redirect()->route('home')->with('error', 'Anda tidak memiliki hak akses ke halaman Admin.');
        }

        // Jika BELUM login sama sekali -> lempar ke login
        return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
    }
}