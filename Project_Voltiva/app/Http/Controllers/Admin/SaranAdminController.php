<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Saran;

class SaranAdminController extends Controller
{
    // Menampilkan daftar seluruh saran masuk dari pengguna
    public function index()
    {
        $saran = Saran::with('pengguna')
            ->latest()
            ->paginate(15);

        return view('admin.saran.index', compact('saran'));
    }

    // Menampilkan detail saran dan otomatis menandai sudah dibaca
    public function show(Saran $saran)
    {
        $saran->load('pengguna');

        // Tandai saran sebagai 'sudah dibaca' jika belum dibaca
        if (!$saran->is_dibaca) {
            $saran->update(['is_dibaca' => true]);
        }

        return view('admin.saran.show', compact('saran'));
    }
    
    // Menghapus data saran
    public function destroy(Saran $saran)
    {
        $saran->delete();

        return redirect()->back()->with('success', 'Pesan saran berhasil dihapus.');
    }
}