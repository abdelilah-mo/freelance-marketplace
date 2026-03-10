<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return response()->json([
                'role' => 'admin',
                'stats' => [
                    'users' => User::count(),
                    'services' => Service::count(),
                    'orders' => Order::count(),
                    'revenue' => Order::query()
                        ->whereHas('payment', fn ($query) => $query->where('status', 'paid'))
                        ->sum('total_amount'),
                ],
            ]);
        }

        if ($user->isFreelancer()) {
            $orders = Order::query()
                ->where('freelancer_id', $user->id)
                ->with(['client', 'service', 'payment'])
                ->latest()
                ->get();

            return response()->json([
                'role' => 'freelancer',
                'stats' => [
                    'services' => $user->services()->count(),
                    'active_services' => $user->services()->where('is_active', true)->count(),
                    'orders_received' => $orders->count(),
                    'completed_revenue' => $orders
                        ->filter(fn ($order) => $order->status === 'completed' && $order->payment?->status === 'paid')
                        ->sum('total_amount'),
                ],
                'services' => $user->services()->with('category')->latest()->get(),
                'orders' => $orders,
            ]);
        }

        $orders = Order::query()
            ->where('client_id', $user->id)
            ->with(['service.freelancer', 'payment'])
            ->latest()
            ->get();

        return response()->json([
            'role' => 'client',
            'stats' => [
                'orders' => $orders->count(),
                'pending_orders' => $orders->where('status', 'pending')->count(),
                'active_orders' => $orders->where('status', 'in_progress')->count(),
                'spent' => $orders
                    ->filter(fn ($order) => $order->payment?->status === 'paid')
                    ->sum('total_amount'),
            ],
            'orders' => $orders,
        ]);
    }
}
