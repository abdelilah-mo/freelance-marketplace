<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class StripeCheckoutService
{
    public function createCheckout(Order $order, Payment $payment): array
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://127.0.0.1:5173'), '/');
        $currency = strtolower(env('STRIPE_CURRENCY', 'usd'));

        if (!env('STRIPE_SECRET_KEY')) {
            $sessionId = 'mock_'.Str::random(18);

            return [
                'provider' => 'mock',
                'session_id' => $sessionId,
                'checkout_url' => "{$frontendUrl}/payments/success?payment_id={$payment->id}&session_id={$sessionId}",
            ];
        }

        $response = Http::withToken(env('STRIPE_SECRET_KEY'))
            ->asForm()
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => "{$frontendUrl}/payments/success?payment_id={$payment->id}&session_id={CHECKOUT_SESSION_ID}",
                'cancel_url' => "{$frontendUrl}/payments/cancel?payment_id={$payment->id}",
                'line_items[0][quantity]' => 1,
                'line_items[0][price_data][currency]' => $currency,
                'line_items[0][price_data][unit_amount]' => (int) round(((float) $order->total_amount) * 100),
                'line_items[0][price_data][product_data][name]' => $order->service->title,
                'metadata[order_id]' => $order->id,
                'metadata[payment_id]' => $payment->id,
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Unable to create Stripe checkout session.');
        }

        $payload = $response->json();

        return [
            'provider' => 'stripe',
            'session_id' => $payload['id'],
            'checkout_url' => $payload['url'],
            'payment_intent_id' => $payload['payment_intent'] ?? null,
        ];
    }

    public function confirmPayment(Payment $payment, ?string $sessionId = null): array
    {
        $resolvedSessionId = $sessionId ?: $payment->checkout_session_id;

        if ($payment->provider === 'mock' || ($resolvedSessionId && str_starts_with($resolvedSessionId, 'mock_'))) {
            return [
                'status' => 'paid',
                'payment_intent_id' => $payment->payment_intent_id,
            ];
        }

        if (!$resolvedSessionId || !env('STRIPE_SECRET_KEY')) {
            return [
                'status' => 'pending',
                'payment_intent_id' => $payment->payment_intent_id,
            ];
        }

        $response = Http::withToken(env('STRIPE_SECRET_KEY'))
            ->get("https://api.stripe.com/v1/checkout/sessions/{$resolvedSessionId}");

        if (!$response->successful()) {
            throw new RuntimeException('Unable to verify Stripe checkout session.');
        }

        $payload = $response->json();

        return [
            'status' => ($payload['payment_status'] ?? 'unpaid') === 'paid' ? 'paid' : 'pending',
            'payment_intent_id' => $payload['payment_intent'] ?? $payment->payment_intent_id,
        ];
    }
}
