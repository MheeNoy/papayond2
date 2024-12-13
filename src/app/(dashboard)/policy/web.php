<?php
// web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\SignController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PriceGroupController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AddOnFrameController;
use App\Http\Controllers\ThailandPostController;
use App\Http\Controllers\UploadImageFromPapayond;


Route::post('/thailand-post/track', [ThailandPostController::class, 'trackParcel']);


Route::get('/thailand-post/token', [ThailandPostController::class, 'getToken']);

Route::post('/upload-qrcode', [UploadController::class, 'uploadQrcode'])->name('upload.qrcode');


Route::post('/save-booking', [BookingController::class, 'saveBooking'])->name('save.booking');

Route::get('/get-add-on-frames', [AddOnFrameController::class, 'getAddOnFramesByUniversity']);

Route::get('/get-price-groups', [PriceGroupController::class, 'getPriceGroupsByUniversity']);

Route::get('/universities', [UniversityController::class, 'getUniversities']);

Route::get('/frames/{universityId}', [UniversityController::class, 'getFramesByUniversity']);

Route::get('/faculties/{universityId}', [UniversityController::class, 'getFacultiesByUniversity']);

Route::get('/signs', [SignController::class, 'getSigns']);

Route::get('/provinces', [AddressController::class, 'getProvinces']);
Route::get('/amphurs/{province_id}', [AddressController::class, 'getAmphurs']);
Route::get('/districts/{amphur_id}', [AddressController::class, 'getDistricts']);
Route::get('/postcode/{amphur_id}', [AddressController::class, 'getPostcode']);








// แสดงฟอร์มล็อกอิน
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');

// ประมวลผลฟอร์มล็อกอิน
Route::post('/check-booking', [LoginController::class, 'checkBooking'])->name('check');

Route::get('/profile', [ProfileController::class, 'showProfile'])->name('profile');





// Route::get('/clear-cache', function() {
//     Artisan::call('config:clear');
//     Artisan::call('cache:clear');
//     return "Cache and config cleared!";
// });
Route::get('/test', function () {
    return view('test');
});


Route::get('/upload/image', [UploadImageFromPapayond::class, 'index']); //Upload Image Test '

// Route::get('/upload/image', function () {
//     dd('ok');
// })->name('cover');  // กำหนดชื่อ route 'cover'

Route::get('/', function () {
    return view('pages.cover');
})->name('cover');  // กำหนดชื่อ route 'cover'

Route::get('/login', function () {
    return view('pages.login');
})->name('login');  // กำหนดชื่อ route 'login'

Route::get('/index', function () {
    return view('pages.index');
})->name('index');  // กำหนดชื่อ route 'index'

// Route::get('/profile', function () {
//     $booking = session('booking');  // ดึงข้อมูลจาก session
//     return view('pages.profile', compact('booking'));
// })->name('profile');// กำหนดชื่อ route 'profile'

use App\Http\Controllers\BookingDetailController;

Route::get('/BookingSuccess', [BookingDetailController::class, 'show'])->name('BookingSuccess'); // กำหนดชื่อ route 'BookingSuccess'

Route::get('/s', function () {
    return view('welcome');
});


// routes/api.php



