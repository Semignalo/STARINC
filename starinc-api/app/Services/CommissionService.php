<?php

namespace App\Services;

use App\Mail\CommissionDistributedMail;
use App\Models\Commission;
use App\Models\Order;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Distribute commission to the buyer's direct upline when an order completes.
     * Rate: 5% for buyer's first completed order, 1% for subsequent orders.
     */
    public function distribute(Order $order): void
    {
        $buyer = $order->user;
        if (!$buyer || !$buyer->referrer_id) {
            return;
        }

        $referrer = User::find($buyer->referrer_id);
        if (!$referrer || $referrer->role === 'admin') {
            return;
        }

        // Determine rate based on whether this is buyer's first completed order
        $hasPreviousOrder = Order::where('user_id', $buyer->id)
            ->where('status', 'completed')
            ->where('id', '!=', $order->id)
            ->exists();

        $rateKey = $hasPreviousOrder ? 'starcenter_repeat_rate' : 'starcenter_first_order_rate';
        $rate    = (float) SystemSetting::getValue($rateKey, $hasPreviousOrder ? 1 : 5);

        $this->createCommission($referrer, $order, $buyer, (float) $order->subtotal, $rate);
    }

    private function createCommission(User $earner, Order $order, User $buyer, float $orderAmount, float $rate): void
    {
        $exists = Commission::where('user_id', $earner->id)
            ->where('order_id', $order->id)
            ->where('level', 1)
            ->exists();

        if ($exists) {
            return;
        }

        $commission = Commission::create([
            'user_id'           => $earner->id,
            'order_id'          => $order->id,
            'source_user_id'    => $buyer->id,
            'order_amount'      => $orderAmount,
            'commission_rate'   => $rate,
            'commission_amount' => round($orderAmount * $rate / 100, 2),
            'level'             => 1,
            'status'            => 'pending',
        ]);

        try {
            Mail::queue(new CommissionDistributedMail($commission));
        } catch (\Exception $e) {
            Log::warning('Failed to queue commission email', ['commission_id' => $commission->id]);
        }
    }

    /**
     * Cancel pending commissions when an order is reversed from completed.
     */
    public function cancelForOrder(Order $order): void
    {
        Commission::where('order_id', $order->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);
    }
}
