<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function createSnapToken(Order $order, string $suffix = ''): string
    {
        $order->load(['items', 'user']);

        $itemDetails = $order->items->map(fn($item) => [
            'id'       => (string) $item->product_id,
            'name'     => mb_substr($item->product_title, 0, 50),
            'price'    => (int) $item->unit_price,
            'quantity' => (int) $item->quantity,
        ])->toArray();

        if ((float) $order->shipping_cost > 0) {
            $itemDetails[] = [
                'id'       => 'SHIPPING',
                'name'     => 'Ongkos Kirim',
                'price'    => (int) $order->shipping_cost,
                'quantity' => 1,
            ];
        }

        if ((float) $order->discount_amount > 0) {
            $itemDetails[] = [
                'id'       => 'DISCOUNT',
                'name'     => 'Diskon Tier',
                'price'    => -((int) $order->discount_amount),
                'quantity' => 1,
            ];
        }

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number . $suffix,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => data_get($order->customer_info, 'name', $order->user?->name ?? 'Customer'),
                'email'      => $order->user?->email ?? '',
                'phone'      => data_get($order->customer_info, 'phone', $order->user?->phone ?? ''),
                'billing_address' => [
                    'address'      => data_get($order->customer_info, 'address'),
                    'city'         => data_get($order->customer_info, 'city'),
                    'postal_code'  => data_get($order->customer_info, 'postal_code'),
                    'country_code' => 'IDN',
                ],
            ],
            'item_details' => $itemDetails,
        ];

        return Snap::getSnapToken($params);
    }
}
