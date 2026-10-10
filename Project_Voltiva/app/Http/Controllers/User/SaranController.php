<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Saran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SaranController extends Controller
{
    // Menampilkan halaman form masukan/saran
    public function create()
    {
        return view('user.saran.create');
    }

    // Menyimpan masukan dari pembeli ke database
    public function store(Request $request)
    {
        $request->validate([
            'pesan'  => 'required|string|min:10|max:1000',
        ],
        [
            'pesan.required' => 'Pesan masukan wajib diisi.',
            'pesan.min'      => 'Pesan masukan minimal berisi 10 karakter.',
            'pesan.max'      => 'Pesan masukan maksimal 1000 karakter.',
        ]);

        Saran::create([
            'pengguna_id' => Auth::id(),
            'pesan'       => trim($request->pesan),
            'is_dibaca'   => false,
        ]);

        return redirect()->back()->with('success', 'Terima kasih! Masukan Anda berhasil dikirim.');
    }
}