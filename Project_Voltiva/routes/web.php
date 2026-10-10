<?php

use Illuminate\Support\Facades\Route;

// Import Auth Controller
use App\Http\Controllers\AuthController;

// Import Controller Umum & User
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KatalogController;
use App\Http\Controllers\LayananController;
use App\Http\Controllers\User\KeranjangController;
use App\Http\Controllers\User\CheckoutController;
use App\Http\Controllers\User\PesananController;
use App\Http\Controllers\User\SaranController;

// Import Controller Admin
use App\Http\Controllers\Admin\KategoriController as AdminKategoriController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\ProdukController as AdminProdukController;
use App\Http\Controllers\Admin\LayananController as AdminLayananController;
use App\Http\Controllers\Admin\PesananController as PesananAdminController;
use App\Http\Controllers\Admin\SaranAdminController;

/*
|--------------------------------------------------------------------------
| 1. RUTE AUTENTIKASI (Login, Register, Logout)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    // Form & Proses Login
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    // Form & Proses Register
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Proses Logout (Harus Login)
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');


/*
|--------------------------------------------------------------------------
| 2. RUTE PUBLIK (Dapat diakses tanpa login)
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/katalog', [KatalogController::class, 'index'])->name('katalog.index');
Route::get('/katalog/{produk}', [KatalogController::class, 'show'])->name('katalog.show');

// Layanan Servis & Upgrade
Route::get('/layanan', [LayananController::class, 'index'])->name('layanan.index');
Route::get('/layanan/{slug}', [LayananController::class, 'show'])->name('layanan.show');


/*
|--------------------------------------------------------------------------
| 3. RUTE USER / PEMBELI (Harus Login)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Manajemen Keranjang Belanja
    Route::get('/keranjang', [KeranjangController::class, 'index'])->name('keranjang.index');
    Route::post('/keranjang', [KeranjangController::class, 'store'])->name('keranjang.store');
    Route::put('/keranjang/{keranjang}', [KeranjangController::class, 'update'])->name('keranjang.update');
    Route::delete('/keranjang/{keranjang}', [KeranjangController::class, 'destroy'])->name('keranjang.destroy');

    // Transaksi Checkout
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    // Riwayat & Detail Pesanan User
    Route::get('/pesanan', [PesananController::class, 'index'])->name('pesanan.index');
    Route::get('/pesanan/{pesanan}', [PesananController::class, 'show'])->name('pesanan.show');
    Route::post('/pesanan/{pesanan}/batalkan', [PesananController::class, 'batalkan'])->name('pesanan.batalkan');

    // Kirim Kritik & Saran
    Route::get('/saran', [SaranController::class, 'create'])->name('saran.create');
    Route::post('/saran', [SaranController::class, 'store'])->name('saran.store');

});


/*
|--------------------------------------------------------------------------
| 4. RUTE ADMIN (Harus Login + Role Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->as('admin.')->group(function () {

    // Dashboard Admin
    Route::get('/dashboard', function () {
        return view('admin.dashboard');
    })->name('dashboard');

    // Kelola Kategori Produk (CRUD Resource)
    Route::resource('kategori', AdminKategoriController::class)->except(['show']);

    // Kelola Brand Produk (CRUD Resource)
    Route::resource('brand', AdminBrandController::class)->except(['show']);

    // Kelola Produk (CRUD Resource)
    Route::resource('produk', AdminProdukController::class);

    // Kelola Layanan Servis (CRUD Resource)
    Route::resource('layanan', AdminLayananController::class)->except(['show']);

    // Kelola Pesanan Masuk
    Route::get('/pesanan', [PesananAdminController::class, 'index'])->name('pesanan.index');
    Route::get('/pesanan/{pesanan}', [PesananAdminController::class, 'show'])->name('pesanan.show');
    Route::put('/pesanan/{pesanan}/status', [PesananAdminController::class, 'updateStatus'])->name('pesanan.updateStatus');

    // Kelola Kritik & Saran
    Route::get('/saran', [SaranAdminController::class, 'index'])->name('saran.index');
    Route::get('/saran/{saran}', [SaranAdminController::class, 'show'])->name('saran.show');
    Route::delete('/saran/{saran}', [SaranAdminController::class, 'destroy'])->name('saran.destroy');

});