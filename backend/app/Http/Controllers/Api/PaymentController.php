<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\StripeCheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function checkout(Request $request, Order $order, StripeCheckoutService $stripeCheckoutService): JsonResponse
    {
        $this->authorizeClientOrAdmin($request, $order);

        $payment = $order->payment ?: Payment::create([
            'order_id' => $order->id,
            'provider' => 'mock',
            'amount' => $order->total_amount,
            'currency' => env('STRIPE_CURRENCY', 'usd'),
            'status' => 'pending',
        ]);

        $checkout = $stripeCheckoutService->createCheckout($order->load('service'), $payment);

        $payment->fill([
            'provider' => $checkout['provider'],
            'checkout_session_id' => $checkout['session_id'],
            'payment_intent_id' => $checkout['payment_intent_id'] ?? $payment->payment_intent_id,
            'status' => 'pending',
        ])->save();

        return response()->json([
            'message' => 'Checkout session created.',
            'data' => [
                'payment' => $payment->fresh(),
                'checkout_url' => $checkout['checkout_url'],
                'provider' => $checkout['provider'],
            ],
        ]);
    }

    public function confirm(Request $request, Payment $payment, StripeCheckoutService $stripeCheckoutService): JsonResponse
    {
        $this->authorizeClientOrAdmin($request, $payment->order);

        $result = $stripeCheckoutService->confirmPayment($payment, $request->input('session_id'));

        $payment->fill([
            'status' => $result['status'],
            'payment_intent_id' => $result['payment_intent_id'] ?? $payment->payment_intent_id,
            'paid_at' => $result['status'] === 'paid' ? now() : $payment->paid_at,
        ])->save();

        return response()->json([
            'message' => $payment->status === 'paid'
                ? 'Payment confirmed successfully.'
                : 'Payment is still pending.',
            'data' => $payment->fresh()->load('order.service'),
        ]);
    }

    private function authorizeClientOrAdmin(Request $request, Order $order): void
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $order->client_id === $user->id, 403, 'You cannot access this payment.');
    }
}
