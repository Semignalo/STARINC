<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CommissionService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Midtrans\Config;

class WebhookController extends Controller
{
    public function midtrans(
        Request $request,
        CommissionService $commissionService,
        OrderService $orderService
    ) {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = true;

        $rawBody = $request->getContent();

        if (empty($rawBody)) {
            // Midtrans dashboard "Test notification URL" ping — abaikan, return 200
            return response()->json(['message' => 'OK']);
        }

        try {
            $payload = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return response()->json(['message' => 'Invalid JSON'], 400);
        }

        // Validasi signature: SHA512(order_id + status_code + gross_amount + server_key)
        $signatureKey = hash('sha512',
            ($payload['order_id'] ?? '') .
            ($payload['status_code'] ?? '') .
            ($payload['gross_amount'] ?? '') .
            config('services.midtrans.server_key')
        );

        if (isset($payload['signature_key']) && $signatureKey !== $payload['signature_key']) {
            \Log::warning('Midtrans webhook signature mismatch', ['order' => $payload['order_id'] ?? null]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus       = $payload['fraud_status'] ?? null;
        $orderNumber       = $payload['order_id'] ?? null;
        $transactionId     = $payload['transaction_id'] ?? null;
        $paymentType       = $payload['payment_type'] ?? null;

        \Log::info('Midtrans webhook', [
            'order'  => $orderNumber,
            'status' => $transactionStatus,
            'fraud'  => $fraudStatus,
        ]);

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            // Handle retry token: "INV-XXXXXXXX-1748799123" → cari "INV-XXXXXXXX"
            $baseNumber = preg_replace('/-\d+$/', '', $orderNumber);
            $order = Order::where('order_number', $baseNumber)->first();
        }
        if (!$order) {
            return response()->json(['message' => 'OK']);
        }

        $order->update([
            'midtrans_order_id' => $transactionId,
            'payment_method'    => $paymentType,
        ]);

        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                $this->onPaymentSuccess($order, $commissionService);
            } else {
                $this->onPaymentFailed($order, $orderService);
            }
        } elseif ($transactionStatus === 'settlement') {
            $this->onPaymentSuccess($order, $commissionService);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire', 'failure'])) {
            $this->onPaymentFailed($order, $orderService);
        }

        return response()->json(['message' => 'OK']);
    }

    private function onPaymentSuccess(Order $order, CommissionService $commissionService): void
    {
        // Idempotency guard — jangan proses dua kali
        if ($order->status !== 'pending_payment') {
            return;
        }

        $order->update(['status' => 'processing']);

        if ($order->user_id) {
            $user = $order->user;
            $productSpend = $order->subtotal - $order->discount_amount;
            $user->increment('cumulative_spending', $productSpend);
            $user->update(['last_transaction_at' => now()]);
        }

        $commissionService->distribute($order);
    }

    private function onPaymentFailed(Order $order, OrderService $orderService): void
    {
        if (in_array($order->status, ['rejected', 'completed'])) {
            return;
        }

        $order->update(['status' => 'rejected']);
        $orderService->restoreStock($order);
    }
}
