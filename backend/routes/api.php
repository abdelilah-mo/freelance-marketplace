<?php

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderManagementController;
use App\Http\Controllers\Api\Admin\ServiceManagementController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth.token')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

Route::middleware('auth.token')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'show']);

    Route::get('/orders/my', [OrderController::class, 'myOrders'])->middleware('role:client,admin');
    Route::get('/orders/received', [OrderController::class, 'receivedOrders'])->middleware('role:freelancer,admin');
    Route::post('/orders', [OrderController::class, 'store'])->middleware('role:client,admin');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->middleware('role:freelancer,admin');

    Route::get('/services/my', [ServiceController::class, 'myServices'])->middleware('role:freelancer,admin');
    Route::post('/services', [ServiceController::class, 'store'])->middleware('role:freelancer,admin');
    Route::post('/services/{service}', [ServiceController::class, 'update'])->middleware('role:freelancer,admin');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->middleware('role:freelancer,admin');

    Route::post('/orders/{order}/checkout', [PaymentController::class, 'checkout'])->middleware('role:client,admin');
    Route::post('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);

    Route::prefix('admin')->middleware('role:admin')->group(function (): void {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::patch('/users/{user}', [UserManagementController::class, 'update']);
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
        Route::get('/services', [ServiceManagementController::class, 'index']);
        Route::patch('/services/{service}', [ServiceManagementController::class, 'update']);
        Route::delete('/services/{service}', [ServiceManagementController::class, 'destroy']);
        Route::get('/orders', [OrderManagementController::class, 'index']);
        Route::patch('/orders/{order}', [OrderManagementController::class, 'update']);
    });
});
