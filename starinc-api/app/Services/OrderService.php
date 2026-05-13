<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\RajaOngkirService;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a new order with server-side price validation and stock checking.
     *
     * @param  array  $customerInfo  {name, phone, address, city, postal_code}
     * @param  array  $items  [{product_id, variant_id?, quantity}]
     * @param  array  $shippingData  {courier, service, cost, destination_city_id}
     *
     * @throws \Exception
     */
    public function createOrder(?User $user, array $customerInfo, array $items, array $shippingData = [], bool $bypassMoq = false, ?float $customDiscountPercent = null): Order
    {
        return DB::transaction(function () use ($user, $customerInfo, $items, $shippingData, $bypassMoq, $customDiscountPercent) {

            // Block inactive accounts
            if ($user && $user->status === 'inactive') {
                throw new \Exception('Akun Anda tidak aktif. Silakan hubungi admin untuk mengaktifkan kembali.');
            }

            // 1. Calculate subtotal from DB prices
            $subtotal      = 0;
            $orderItems    = [];
            $stockDeductions = [];

            foreach ($items as $item) {
                $product  = Product::lockForUpdate()->findOrFail($item['product_id']);
                $variant  = null;
                $unitPrice   = $product->price;
                $variantName = null;
                $quantity    = max(1, (int) $item['quantity']);

                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::lockForUpdate()
                        ->where('id', $item['variant_id'])
                        ->where('product_id', $product->id)
                        ->firstOrFail();
                    $unitPrice   = $variant->price;
                    $variantName = $variant->name;
                }

                $this->validateStock($product, $variant, $quantity);

                $lineTotal  = round($unitPrice * $quantity, 2);
                $subtotal  += $lineTotal;

                $orderItems[] = [
                    'product_id'        => $product->id,
                    'product_variant_id'=> $variant?->id,
                    'product_title'     => $product->title,
                    'variant_name'      => $variantName,
                    'unit_price'        => $unitPrice,
                    'quantity'          => $quantity,
                    'line_total'        => $lineTotal,
                ];

                $stockDeductions[] = [
                    'model' => $variant ?? $product,
                    'qty'   => $quantity,
                ];
            }

            // 2. Discount for starcenter members (custom or default 23%)
            $discountPercent = 0;
            $discountAmount  = 0;
            if ($user && $user->role === 'starcenter') {
                $discountPercent = $customDiscountPercent !== null
                    ? $customDiscountPercent
                    : (float) SystemSetting::getValue('starcenter_discount', 23);
                $discountAmount  = round($subtotal * $discountPercent / 100, 2);
            }

            // 3. Shipping cost
            if (!empty($shippingData['courier']) && !empty($shippingData['service']) && isset($shippingData['destination_city_id'])) {
                $rajaOngkir    = app(RajaOngkirService::class);
                $totalWeight   = $this->calculateTotalWeight($items);
                $validated     = $rajaOngkir->validateCost(
                    (int) $shippingData['destination_city_id'],
                    $totalWeight,
                    $shippingData['courier'],
                    $shippingData['service']
                );
                $shippingCost = $validated !== null ? (float) $validated : (float) ($shippingData['cost'] ?? 0);
            } else {
                $shippingCost = (float) SystemSetting::getValue('flat_shipping_cost', 20000);
            }

            // 4. Total
            $total = $subtotal - $discountAmount + $shippingCost;

            // 5. MOQ: first order must be >= 50 juta (skipped when bypassMoq = true)
            if (!$bypassMoq && $user && $user->role === 'starcenter') {
                $isFirstOrder = $user->cumulative_spending == 0
                    && !Order::where('user_id', $user->id)
                        ->whereNotIn('status', ['rejected'])
                        ->exists();

                if ($isFirstOrder) {
                    $moq = (float) SystemSetting::getValue('starcenter_moq_first', 50000000);
                    if ($subtotal < $moq) {
                        throw new \Exception(
                            'Order pertama minimum Rp ' . number_format($moq, 0, ',', '.') . ' (sebelum diskon).'
                        );
                    }
                }
            }

            // 6. Create order
            $order = Order::create([
                'user_id'             => $user?->id,
                'customer_info'       => $customerInfo,
                'subtotal'            => $subtotal,
                'discount_percent'    => $discountPercent,
                'discount_amount'     => $discountAmount,
                'shipping_cost'       => $shippingCost,
                'shipping_courier'    => $shippingData['courier'] ?? null,
                'shipping_service'    => $shippingData['service'] ?? null,
                'destination_city_id' => $shippingData['destination_city_id'] ?? null,
                'total'               => $total,
                'status'              => 'pending_payment',
            ]);

            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            // 7. Deduct stock
            foreach ($stockDeductions as $deduction) {
                $model = $deduction['model'];
                if ($model->stock !== null) {
                    $model->decrement('stock', $deduction['qty']);
                }
            }

            // 8. Update last transaction date
            if ($user) {
                $user->update(['last_transaction_at' => now()]);
            }

            return $order->load('items');
        });
    }

    public function calculateTotalWeight(array $items): int
    {
        $total = 0;
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            $weight  = $product?->weight ?? 500;
            $total  += $weight * max(1, (int) ($item['quantity'] ?? 1));
        }
        return max(1, $total);
    }

    public function restoreStock(Order $order): void
    {
        $order->loadMissing('items.product', 'items.variant');

        foreach ($order->items as $item) {
            if ($item->product_variant_id && $item->variant) {
                $variant = $item->variant;
                if ($variant->stock !== null) {
                    $variant->increment('stock', $item->quantity);
                }
            } elseif ($item->product) {
                $product = $item->product;
                if ($product->stock !== null) {
                    $product->increment('stock', $item->quantity);
                }
            }
        }
    }

    private function validateStock(Product $product, ?ProductVariant $variant, int $quantity): void
    {
        if ($variant !== null) {
            if ($variant->stock !== null && $variant->stock < $quantity) {
                throw new \Exception(
                    "Stok variant '{$variant->name}' dari produk '{$product->title}' tidak mencukupi. "
                    . "Tersisa: {$variant->stock}, diminta: {$quantity}."
                );
            }
        } else {
            if ($product->stock !== null && $product->stock < $quantity) {
                throw new \Exception(
                    "Stok produk '{$product->title}' tidak mencukupi. "
                    . "Tersisa: {$product->stock}, diminta: {$quantity}."
                );
            }
        }
    }
}
