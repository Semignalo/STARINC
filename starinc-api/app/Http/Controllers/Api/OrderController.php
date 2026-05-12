<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\UploadPaymentProofRequest;
use App\Mail\OrderConfirmedMail;
use App\Mail\PaymentApprovedMail;
use App\Mail\PaymentRejectedMail;
use App\Mail\OrderShippedMail;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\SystemSetting;
use App\Services\CommissionService;
use App\Services\MidtransService;
use App\Services\OrderService;
use App\Services\TierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    /**
     * Create a new order (checkout).
     * Validasi variant_id milik product_id ditangani oleh CheckoutRequest.
     */
    public function checkout(CheckoutRequest $request, OrderService $orderService, MidtransService $midtransService)
    {
        $validated = $request->validated();

        try {
            $order = $orderService->createOrder(
                $request->user(),
                $validated['customer_info'],
                $validated['items'],
                [
                    'courier'             => $validated['shipping_courier'] ?? null,
                    'service'             => $validated['shipping_service'] ?? null,
                    'cost'                => $validated['shipping_cost'] ?? null,
                    'destination_city_id' => $validated['destination_city_id'] ?? null,
                ]
            );

            // Send order confirmation email
            try {
                Mail::queue(new OrderConfirmedMail($order));
            } catch (\Exception $mailError) {
                \Log::warning('Failed to queue order confirmation email', ['order_id' => $order->id]);
            }

            // Generate Midtrans Snap token
            $snapToken = null;
            try {
                $snapToken = $midtransService->createSnapToken($order);
            } catch (\Exception $e) {
                \Log::error('Midtrans snap token error', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            }

            return response()->json([
                'data' => [
                    'message'      => 'Pesanan berhasil dibuat.',
                    'order_number' => $order->order_number,
                    'order_id'     => $order->id,
                    'total'        => (float) $order->total,
                    'snap_token'   => $snapToken,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Cancel an unpaid order (user-initiated).
     * Hanya bisa jika status masih pending_payment.
     */
    public function cancelOrder(Request $request, string $orderNumber, OrderService $orderService)
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->status !== 'pending_payment') {
            return response()->json([
                'message' => 'Pesanan tidak dapat dibatalkan karena sudah diproses atau sudah lunas.',
            ], 422);
        }

        $order->update(['status' => 'rejected']);
        $orderService->restoreStock($order);

        return response()->json(['message' => 'Pesanan berhasil dibatalkan.']);
    }

    /**
     * Re-generate Snap token for an unpaid order (user closed popup without paying).
     */
    public function repaySnapToken(Request $request, string $orderNumber, MidtransService $midtransService)
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending_payment')
            ->firstOrFail();

        try {
            $snapToken = $midtransService->createSnapToken($order, '-' . time());
            return response()->json(['snap_token' => $snapToken]);
        } catch (\Exception $e) {
            \Log::error('Repay snap token error', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal membuat token pembayaran.'], 500);
        }
    }

    /**
     * Get user's order history.
     */
    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'paymentProof'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    /**
     * Get invoice for a specific order.
     * Requires auth — user can only view their own orders; admin can view any.
     */
    public function invoice(Request $request, string $orderNumber)
    {
        $user = $request->user();

        $query = Order::where('order_number', $orderNumber)
            ->with(['items', 'paymentProof']);

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $order = $query->firstOrFail();

        $paymentConfig = [
            'bank_name' => SystemSetting::getValue('payment_bank_name', 'BCA'),
            'account_number' => SystemSetting::getValue('payment_account_number', '888888888'),
            'account_name' => SystemSetting::getValue('payment_account_name', 'PT BBK'),
        ];

        // Expose id as order_id for payment proof upload; strip user_id to prevent enumeration
        $orderData = $order->toArray();
        $orderData['order_id'] = $orderData['id'];
        unset($orderData['id'], $orderData['user_id']);

        return response()->json([
            'order' => $orderData,
            'payment_config' => $paymentConfig,
        ]);
    }

    /**
     * Upload payment proof for an order.
     *
     * B5: Validasi MIME type ketat (jpg, png, pdf), max 2MB.
     * File disimpan di private storage (storage/app/private/) agar tidak bisa diakses publik.
     * Admin mengakses file melalui endpoint terpisah dengan otorisasi.
     */
    public function uploadPaymentProof(UploadPaymentProofRequest $request, int $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (! in_array($order->status, ['pending_payment', 'processing'])) {
            return response()->json([
                'message' => 'Bukti pembayaran hanya bisa diunggah untuk order yang belum selesai.',
            ], 422);
        }

        // Simpan ke private storage — tidak bisa diakses via URL publik
        $path = $request->file('file')->store('payment-proofs', 'local');

        $proof = PaymentProof::updateOrCreate(
            ['order_id' => $order->id],
            [
                'file_path' => $path,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah.',
            'data' => [
                'proof_id' => $proof->id,
                'status' => $proof->status,
                'created_at' => $proof->created_at,
            ],
        ]);
    }

    /**
     * Serve payment proof file to admin (private storage access).
     * Hanya admin yang bisa mengakses file ini — proteksi via EnsureIsAdmin middleware di route.
     */
    public function servePaymentProof(int $proofId)
    {
        $proof = PaymentProof::findOrFail($proofId);

        if (! Storage::disk('local')->exists($proof->file_path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return Storage::disk('local')->response($proof->file_path);
    }

    // ── Admin Endpoints ──

    /**
     * List all orders (admin).
     */
    public function adminIndex(Request $request)
    {
        $query = Order::with(['items', 'paymentProof', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json($orders);
    }

    /**
     * Update order status (admin).
     */
    public function updateStatus(Request $request, int $id, TierService $tierService, CommissionService $commissionService, OrderService $orderService)
    {
        $order = Order::with('user')->findOrFail($id);
        $oldStatus = $order->status;

        $validated = $request->validate([
            'status' => 'required|in:pending_payment,processing,shipped,completed,rejected',
        ]);

        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return response()->json(['message' => 'Status tidak berubah.']);
        }

        $order->update(['status' => $newStatus]);

        // Business logic on status change
        if ($order->user) {
            $user = $order->user;

            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                // Add to cumulative spending & evaluate tier upgrade
                $productSpend = $order->subtotal - $order->discount_amount;
                $user->increment('cumulative_spending', $productSpend);
                $user->update(['last_transaction_at' => now()]);

                $tierService->evaluateUpgrade($user->fresh());
                $commissionService->distribute($order);

            } elseif ($oldStatus === 'completed' && $newStatus !== 'completed') {
                // Reverse: subtract spending & cancel commissions
                $productSpend = $order->subtotal - $order->discount_amount;
                $user->decrement('cumulative_spending', min($user->cumulative_spending, $productSpend));

                $tierService->evaluateUpgrade($user->fresh());
                $commissionService->cancelForOrder($order);
            }
        }

        // B4: Kembalikan stok jika order dibatalkan/ditolak dari status non-rejected
        if ($newStatus === 'rejected' && $oldStatus !== 'rejected') {
            $orderService->restoreStock($order);
        }

        // Send status change emails
        try {
            if ($newStatus === 'processing' && $oldStatus === 'pending_payment') {
                Mail::queue(new PaymentApprovedMail($order));
            } elseif ($newStatus === 'shipped') {
                Mail::queue(new OrderShippedMail($order));
            }
        } catch (\Exception $mailError) {
            \Log::warning('Failed to queue order status email', ['order_id' => $id, 'status' => $newStatus]);
        }

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui menjadi '.$newStatus,
            'order' => $order->fresh()->load(['items', 'paymentProof']),
        ]);
    }

    /**
     * Approve/reject payment proof (admin).
     */
    public function reviewPayment(Request $request, int $orderId)
    {
        $order = Order::findOrFail($orderId);
        $proof = PaymentProof::where('order_id', $order->id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:500',
        ]);

        $proof->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['notes'] ?? null,
            'reviewed_at' => now(),
        ]);

        // Send payment review email
        try {
            if ($validated['status'] === 'approved') {
                // If approved, auto-change order status to processing
                if ($order->status === 'pending_payment') {
                    $order->update(['status' => 'processing']);
                }
                Mail::queue(new PaymentApprovedMail($order));
            } else {
                // Payment rejected
                Mail::queue(new PaymentRejectedMail($order, $validated['notes'] ?? null));
            }
        } catch (\Exception $mailError) {
            \Log::warning('Failed to queue payment review email', ['order_id' => $orderId, 'status' => $validated['status']]);
        }

        return response()->json([
            'message' => 'Review pembayaran berhasil.',
            'proof' => $proof,
        ]);
    }

    /**
     * Update tracking number for shipped order (admin).
     */
    public function updateTracking(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'shipping_provider' => 'nullable|string|max:50',
        ]);

        $order->update([
            'tracking_number' => $validated['tracking_number'],
            'shipping_provider' => $validated['shipping_provider'] ?? null,
        ]);

        // Send tracking notification email
        try {
            Mail::queue(new OrderShippedMail($order->fresh()));
        } catch (\Exception $mailError) {
            \Log::warning('Failed to queue shipping notification email', ['order_id' => $id]);
        }

        return response()->json([
            'message' => 'Nomor resi berhasil diperbarui.',
            'order' => $order->fresh()->load(['items', 'paymentProof']),
        ]);
    }
}
