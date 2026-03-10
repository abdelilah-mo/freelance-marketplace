<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'requirements' => ['nullable', 'string', 'max:4000'],
        ]);

        $service = Service::query()
            ->where('is_active', true)
            ->with('freelancer')
            ->findOrFail($validated['service_id']);

        abort_if($service->freelancer_id === $request->user()->id, 422, 'You cannot order your own service.');

        $order = Order::create([
            'service_id' => $service->id,
            'client_id' => $request->user()->id,
            'freelancer_id' => $service->freelancer_id,
            'requirements' => $validated['requirements'] ?? null,
            'total_amount' => $service->price,
            'status' => 'pending',
        ]);

        Payment::create([
            'order_id' => $order->id,
            'provider' => 'mock',
            'amount' => $service->price,
            'currency' => env('STRIPE_CURRENCY', 'usd'),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Order created successfully.',
            'data' => $order->load(['service.category', 'service.freelancer', 'payment']),
        ], 201);
    }

    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('client_id', $request->user()->id)
            ->with(['service.category', 'freelancer', 'payment'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders,
        ]);
    }

    public function receivedOrders(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['service.category', 'client', 'payment'])
            ->latest();

        if (!$request->user()->isAdmin()) {
            $query->where('freelancer_id', $request->user()->id);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $order->freelancer_id === $user->id, 403, 'You cannot update this order.');

        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Order status updated.',
            'data' => $order->load(['service', 'client', 'freelancer', 'payment']),
        ]);
    }
}
