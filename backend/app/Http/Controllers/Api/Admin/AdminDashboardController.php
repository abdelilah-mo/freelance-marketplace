<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'users' => User::count(),
                'freelancers' => User::where('role', 'freelancer')->count(),
                'clients' => User::where('role', 'client')->count(),
                'services' => Service::count(),
                'orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'completed_orders' => Order::where('status', 'completed')->count(),
                'revenue' => Order::query()
                    ->whereHas('payment', fn ($query) => $query->where('status', 'paid'))
                    ->sum('total_amount'),
            ],
        ]);
    }
}
