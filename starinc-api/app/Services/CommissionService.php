<?php

namespace App\Services;

use App\Mail\CommissionDistributedMail;
use App\Models\Commission;
use App\Models\Order;
use App\Models\StarcenterNetwork;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Distribute commissions when an order is completed.
     */
    public function distribute(Order $order): void
    {
        $buyer = $order->user;
        if (!$buyer || !$buyer->referrer_id) {
            return;
        }

        $referrer = User::find($buyer->referrer_id);
        if (!$referrer) {
            return;
        }

        $orderAmount = $order->subtotal;

        if ($referrer->role === 'regular') {
            // SDP: Single-level commission only
            $rate = (float) SystemSetting::getValue('sdp_commission_rate', 5);
            $this->createCommission($referrer, $order, $buyer, $orderAmount, $rate, 1);
            return;
        }

        if ($referrer->role === 'starcenter') {
            // Starcenter: Multi-level commission (max 7 levels)
            $this->distributeMLM($referrer, $order, $buyer, $orderAmount);
        }
    }

    /**
     * Distribute MLM commissions up the starcenter chain.
     */
    private function distributeMLM(User $starcenter, Order $order, User $buyer, float $orderAmount): void
    {
        $maxLevel = (int) SystemSetting::getValue('starcenter_max_level', 7);

        // Fetch entire upline chain in single query (closure table)
        $ancestors = StarcenterNetwork::where('downline_id', $buyer->id)
            ->where('depth', '<=', $maxLevel)
            ->orderBy('depth', 'asc')
            ->with('upline')
            ->get();

        foreach ($ancestors as $ancestor) {
            $level = $ancestor->depth;
            $rateKey = "starcenter_level_{$level}_rate";
            $rate = (float) SystemSetting::getValue($rateKey, 0);

            if ($rate > 0) {
                $this->createCommission($ancestor->upline, $order, $buyer, $orderAmount, $rate, $level);
            }
        }
    }

    /**
     * Create a single commission record.
     */
    private function createCommission(User $earner, Order $order, User $buyer, float $orderAmount, float $rate, int $level): void
    {
        // Don't create duplicate commissions
        $exists = Commission::where('user_id', $earner->id)
            ->where('order_id', $order->id)
            ->where('level', $level)
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
            'level'             => $level,
            'status'            => 'pending',
        ]);

        // Send commission notification email
        try {
            Mail::queue(new CommissionDistributedMail($commission));
        } catch (\Exception $mailError) {
            Log::warning('Failed to queue commission email', ['commission_id' => $commission->id]);
        }
    }

    /**
     * Cancel commissions when an order is reversed from completed.
     */
    public function cancelForOrder(Order $order): void
    {
        Commission::where('order_id', $order->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);
    }
}
