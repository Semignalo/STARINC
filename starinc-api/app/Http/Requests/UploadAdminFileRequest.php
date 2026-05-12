<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadAdminFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by EnsureIsAdmin middleware
    }

    public function rules(): array
    {
        return [
            'file'   => 'required|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov|max:51200', // max 50MB
            'folder' => 'nullable|string|max:100|regex:/^[a-zA-Z0-9_\-\/]+$/',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File wajib diunggah.',
            'file.mimes'    => 'Format file tidak didukung. Gunakan: jpg, png, gif, webp, mp4, webm, atau mov.',
            'file.max'      => 'Ukuran file maksimal 50MB.',
            'folder.regex'  => 'Nama folder hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
        ];
    }
}
