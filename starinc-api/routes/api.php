<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\NetworkController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\StarCenterApplicationController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Models\Tier;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Password Reset (public)
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

// Email Verification
// No 'signed' middleware here — controller validates signature internally
// so it can redirect to frontend with error instead of returning 403
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:6,1');

// Products (public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Appearance & Payment Info (public)
Route::get('/appearance', [SettingsController::class, 'appearance']);
Route::get('/settings/payment', [SettingsController::class, 'paymentInfo']);

// Invoice (auth required — ownership checked in controller)
// Moved out of public block: CRIT-1 fix — invoice exposed full PII without auth

// Referral code lookup (public — used on register form)
Route::get('/referral/{code}', [AuthController::class, 'lookupReferral']);

// Tiers list (public)
Route::get('/tiers', function () {
    return response()->json(Tier::orderBy('sort_order')->get());
});

// Testimonials (public)
Route::get('/testimonials', [TestimonialController::class, 'index']);

// PDF stream with CORS (public, needed because static storage files don't have CORS headers)
Route::get('/products/{id}/pdf', [ProductController::class, 'streamPdf']);

// Starcenter applications (public submission)
Route::get('/starcenter-applications/check-name', [StarCenterApplicationController::class, 'checkCenterName']);
Route::post('/starcenter-applications', [StarCenterApplicationController::class, 'store']);

// Midtrans webhook (no auth — Midtrans does not send Bearer token)
Route::post('/webhook/midtrans', [WebhookController::class, 'midtrans']);

// Shipping — RajaOngkir proxy (public, no auth)
Route::prefix('shipping')->group(function () {
    Route::get('/provinces', [ShippingController::class, 'provinces']);
    Route::get('/cities/{provinceId}', [ShippingController::class, 'cities']);
    Route::post('/cost', [ShippingController::class, 'cost']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Checkout & Orders
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::post('/orders/{orderNumber}/repay', [OrderController::class, 'repaySnapToken']);
    Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancelOrder']);
    Route::get('/user/orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/{orderNumber}/invoice', [OrderController::class, 'invoice']);
    Route::post('/orders/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof']);

    // Commissions (my commissions)
    Route::get('/user/commissions', [CommissionController::class, 'myCommissions']);

    // Referral info & network
    Route::get('/user/referral-link', [NetworkController::class, 'referralInfo']);

    // System Settings (for Starcenter/MLM flow)
    Route::get('/settings/system', [SettingsController::class, 'systemSettings']);

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */
    Route::middleware(EnsureIsAdmin::class)->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Orders
        Route::get('/orders', [OrderController::class, 'adminIndex']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/payment', [OrderController::class, 'reviewPayment']);
        Route::put('/orders/{id}/tracking', [OrderController::class, 'updateTracking']);

        // Serve private payment proof file (hanya admin)
        Route::get('/payment-proofs/{proofId}/file', [OrderController::class, 'servePaymentProof']);

        // Products (CRUD)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/products/{id}/media', [ProductController::class, 'uploadMedia']);
        Route::delete('/products/{id}/media/{mediaId}', [ProductController::class, 'deleteMedia']);
        Route::put('/products/{id}/media/reorder', [ProductController::class, 'reorderMedia']);
        Route::post('/products/{id}/pdf', [ProductController::class, 'uploadPdf']);
        Route::delete('/products/{id}/pdf', [ProductController::class, 'removePdf']);

        // Users
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/network', [AdminController::class, 'networkTree']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::put('/users/{id}/password', [AdminController::class, 'updateUserPassword']);
        Route::put('/users/{id}/tier', [AdminController::class, 'updateUserTier']);
        Route::get('/users/{id}/commissions', [AdminController::class, 'getUserCommissions']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        // Commissions
        Route::get('/commissions', [AdminController::class, 'commissions']);
        Route::put('/commissions/{id}/pay', [AdminController::class, 'payCommission']);
        Route::post('/commissions/bulk-pay', [AdminController::class, 'bulkPayCommissions']);
        Route::get('/commissions/export', [AdminController::class, 'exportCommissions']);

        // Export Orders (place before {id} routes if needed, but it's isolated)
        Route::get('/orders/export', [AdminController::class, 'exportOrders']);

        // Media Upload (for Appearance page video/image upload)
        Route::post('/upload', [SettingsController::class, 'upload']);

        // Starcenter Applications
        Route::get('/starcenter-applications', [StarCenterApplicationController::class, 'index']);
        Route::get('/starcenter-applications/{id}', [StarCenterApplicationController::class, 'show']);
        Route::get('/starcenter-applications/{id}/document', [StarCenterApplicationController::class, 'serveDocument']);
        Route::post('/starcenter-applications/{id}/approve', [StarCenterApplicationController::class, 'approve']);
        Route::post('/starcenter-applications/{id}/reject', [StarCenterApplicationController::class, 'reject']);

        // Testimonials (admin CRUD)
        Route::get('/testimonials', [TestimonialController::class, 'adminIndex']);
        Route::post('/testimonials', [TestimonialController::class, 'store']);
        Route::put('/testimonials/reorder', [TestimonialController::class, 'reorder']);
        Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
        Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

        // Settings
        Route::get('/settings', [SettingsController::class, 'adminSettings']);
        Route::put('/settings', [SettingsController::class, 'updateSettings']);
        Route::put('/settings/tiers/{id}', [SettingsController::class, 'updateTier']);
        Route::get('/appearance', [SettingsController::class, 'adminAppearance']);
        Route::put('/appearance', [SettingsController::class, 'updateAppearance']);
    });
});
