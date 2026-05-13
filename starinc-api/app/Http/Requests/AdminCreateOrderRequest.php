<?php

namespace App\Http\Requests;

use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;

class AdminCreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // EnsureIsAdmin middleware handles authorization
    }

    public function rules(): array
    {
        return [
            'user_id'                   => 'required|integer|exists:users,id',
            'customer_info.name'        => 'required|string|max:255',
            'customer_info.phone'       => 'required|string|max:20',
            'customer_info.address'     => 'required|string|max:500',
            'customer_info.city'        => 'required|string|max:100',
            'customer_info.postal_code' => 'required|string|max:10',
            'items'                     => 'required|array|min:1',
            'items.*.product_id'        => 'required|integer|exists:products,id',
            'items.*.variant_id'        => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity'          => 'required|integer|min:1',
            'discount_percent'          => 'nullable|numeric|min:0|max:100',
        ];
    }

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

    public function messages(): array
    {
        return [
            'user_id.required'                   => 'Pilih akun starcenter.',
            'user_id.exists'                     => 'Akun starcenter tidak ditemukan.',
            'customer_info.name.required'        => 'Nama penerima wajib diisi.',
            'customer_info.phone.required'       => 'Nomor telepon wajib diisi.',
            'customer_info.address.required'     => 'Alamat pengiriman wajib diisi.',
            'customer_info.city.required'        => 'Kota wajib diisi.',
            'customer_info.postal_code.required' => 'Kode pos wajib diisi.',
            'items.required'                     => 'Minimal satu produk harus dipilih.',
            'items.*.product_id.exists'          => 'Produk tidak ditemukan.',
            'items.*.variant_id.exists'          => 'Variant produk tidak ditemukan.',
            'items.*.quantity.min'               => 'Quantity minimal 1.',
            'discount_percent.min'               => 'Diskon tidak boleh negatif.',
            'discount_percent.max'               => 'Diskon maksimal 100%.',
        ];
    }
}
