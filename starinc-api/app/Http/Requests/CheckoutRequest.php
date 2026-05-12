<?php

namespace App\Http\Requests;

use App\Models\ProductVariant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_info.name'        => 'required|string|max:255',
            'customer_info.phone'       => 'required|string|max:20',
            'customer_info.address'     => 'required|string|max:500',
            'customer_info.city'        => 'required|string|max:100',
            'customer_info.postal_code' => 'required|string|max:10',
            // RajaOngkir fields — wajib jika RAJAONGKIR_API_KEY dikonfigurasi, opsional jika belum
            'shipping_courier'          => $this->rajaOngkirRequired() ? 'required|in:jne,pos,tiki' : 'nullable|in:jne,pos,tiki',
            'shipping_service'          => $this->rajaOngkirRequired() ? 'required|string|max:30' : 'nullable|string|max:30',
            'shipping_cost'             => $this->rajaOngkirRequired() ? 'required|numeric|min:0' : 'nullable|numeric|min:0',
            'destination_city_id'       => $this->rajaOngkirRequired() ? 'required|integer|min:1' : 'nullable|integer|min:1',
            'items'                     => 'required|array|min:1',
            'items.*.product_id'        => 'required|integer|exists:products,id',
            'items.*.variant_id'        => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity'          => 'required|integer|min:1',
        ];
    }

    private function rajaOngkirRequired(): bool
    {
        return ! empty(config('services.rajaongkir.api_key'));
    }

    /**
     * Run after standard validation — verifikasi bahwa variant_id memang milik product_id yang dikirim.
     * Mencegah manipulasi harga dari frontend.
     */
    public function after(): array
    {
        return [
            function ($validator) {
                $items = $this->input('items', []);

                foreach ($items as $index => $item) {
                    if (empty($item['variant_id'])) {
                        continue;
                    }

                    $variantExists = ProductVariant::where('id', $item['variant_id'])
                        ->where('product_id', $item['product_id'])
                        ->exists();

                    if (! $variantExists) {
                        $validator->errors()->add(
                            "items.{$index}.variant_id",
                            'Variant tidak valid untuk produk yang dipilih.'
                        );
                    }
                }
            },
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'items.*.product_id.exists' => 'Produk tidak ditemukan.',
            'items.*.variant_id.exists' => 'Variant produk tidak ditemukan.',
            'items.*.quantity.min' => 'Quantity minimal 1.',
            'customer_info.name.required'        => 'Nama penerima wajib diisi.',
            'customer_info.phone.required'       => 'Nomor telepon wajib diisi.',
            'customer_info.address.required'     => 'Alamat pengiriman wajib diisi.',
            'customer_info.city.required'        => 'Kota wajib diisi.',
            'customer_info.postal_code.required' => 'Kode pos wajib diisi.',
            'shipping_courier.required'          => 'Pilih kurir pengiriman.',
            'shipping_courier.in'                => 'Kurir tidak valid.',
            'shipping_service.required'          => 'Pilih layanan pengiriman.',
            'shipping_cost.required'             => 'Biaya pengiriman wajib ada.',
            'destination_city_id.required'       => 'Kota tujuan wajib dipilih.',
        ];
    }
}
