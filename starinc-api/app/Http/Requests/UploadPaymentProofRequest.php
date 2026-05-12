<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentProofRequest extends FormRequest
{
    /**
     * Hanya user yang login yang boleh upload bukti pembayaran.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan validasi untuk upload bukti pembayaran.
     *
     * - MIME type dibatasi: JPEG, PNG, PDF
     * - Ukuran maksimal 2MB (2048 KB)
     * Keamanan: mimes: tidak bisa dimanipulasi header MIME palsu karena Laravel
     * memvalidasi isi file, bukan hanya extension.
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048', // 2MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File bukti pembayaran wajib diunggah.',
            'file.file' => 'Upload harus berupa file.',
            'file.mimes' => 'Format file harus JPG, PNG, atau PDF.',
            'file.max' => 'Ukuran file maksimal 2MB.',
        ];
    }
}
