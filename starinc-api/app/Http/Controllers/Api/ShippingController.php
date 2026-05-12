<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\RajaOngkirService;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(private RajaOngkirService $rajaOngkir) {}

    /**
     * GET /api/shipping/provinces
     * Return semua provinsi dari RajaOngkir.
     */
    public function provinces(): \Illuminate\Http\JsonResponse
    {
        $provinces = $this->rajaOngkir->getProvinces();

        return response()->json(['data' => $provinces]);
    }

    /**
     * GET /api/shipping/cities/{provinceId}
     * Return kota-kota dalam satu provinsi.
     */
    public function cities(int $provinceId): \Illuminate\Http\JsonResponse
    {
        $cities = $this->rajaOngkir->getCities($provinceId);

        return response()->json(['data' => $cities]);
    }

    /**
     * POST /api/shipping/cost
     * Hitung ongkir untuk semua kurir Starter (JNE, POS, TIKI).
     *
     * Request body: { city_id: int, items: [{product_id, variant_id?, quantity}] }
     * Berat dihitung server-side dari tabel products untuk mencegah manipulasi.
     */
    public function cost(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'city_id' => 'required|integer|min:1',
            'items'   => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $totalWeight = $this->calculateWeight($validated['items']);

        $options = $this->rajaOngkir->getAllCosts((int) $validated['city_id'], $totalWeight);

        return response()->json([
            'data' => [
                'weight'  => $totalWeight,
                'options' => $options,
            ],
        ]);
    }

    /**
     * Hitung total berat dari items berdasarkan data produk di DB.
     * Produk tanpa weight → pakai default 500g per item.
     */
    private function calculateWeight(array $items): int
    {
        $totalGram = 0;
        $defaultWeight = 500;

        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            $weight = $product?->weight ?? $defaultWeight;
            $totalGram += $weight * max(1, (int) $item['quantity']);
        }

        return max(1, $totalGram);
    }
}
