<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->with(['service.category', 'client', 'freelancer', 'payment'])
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order updated successfully.',
            'data' => $order->fresh()->load(['service', 'client', 'freelancer', 'payment']),
        ]);
    }
}
