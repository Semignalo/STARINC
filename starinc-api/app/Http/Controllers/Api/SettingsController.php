<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadAdminFileRequest;
use App\Models\AppearanceSetting;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    // ── Public ──

    /**
     * Get appearance settings (public / homepage CMS).
     */
    public function appearance()
    {
        return response()->json(AppearanceSetting::getAll());
    }

    /**
     * Get payment config (public / invoice page).
     */
    public function paymentInfo()
    {
        return response()->json([
            'bank_name'      => SystemSetting::getValue('payment_bank_name', 'BCA'),
            'account_number' => SystemSetting::getValue('payment_account_number', '888888888'),
            'account_name'   => SystemSetting::getValue('payment_account_name', 'PT BBK'),
        ]);
    }

    /**
     * Get system settings (authenticated users).
     * Returns MOQ threshold and other general settings for Starcenter/MLM flow.
     */
    public function systemSettings()
    {
        return response()->json([
            'moq_threshold' => (int) SystemSetting::getValue('moq_threshold', 5000000),
        ]);
    }

    // ── Admin ──

    /**
     * Get all system settings grouped (admin).
     */
    public function adminSettings()
    {
        $settings = SystemSetting::all()->groupBy('group')->map(function ($group) {
            return $group->pluck('value', 'key');
        });

        return response()->json($settings);
    }

    /**
     * Update system settings (admin).
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key'   => 'required|string',
            'settings.*.value' => 'required|string',
            'settings.*.group' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            SystemSetting::setValue(
                $setting['key'],
                $setting['value'],
                $setting['group'] ?? 'general'
            );
        }

        return response()->json(['message' => 'Pengaturan berhasil disimpan.']);
    }

    /**
     * Get appearance settings (admin).
     */
    public function adminAppearance()
    {
        return response()->json(AppearanceSetting::getAll());
    }

    /**
     * Update appearance settings (admin).
     */
    public function updateAppearance(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            AppearanceSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json(['message' => 'Tampilan berhasil diperbarui.']);
    }

    /**
     * Upload a media file (video/image) for use in Appearance settings.
     *
     * Accepts multipart/form-data with:
     *   - file   : required, image or video (jpg/png/gif/webp/mp4/webm/mov), max 50MB
     *   - folder : optional, subdirectory name inside uploads/ (e.g. "hero", "banners")
     *
     * Returns { url: string } — a publicly accessible URL to the stored file.
     */
    public function upload(UploadAdminFileRequest $request)
    {
        $folder = $request->input('folder', 'uploads');
        // Sanitise: strip leading/trailing slashes, collapse any double-slashes
        $folder = trim(preg_replace('#/+#', '/', $folder), '/');

        $path = $request->file('file')->store($folder, 'public');

        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url]);
    }

    /**
     * Update Tier setting (admin)
     */
    public function updateTier(Request $request, int $id)
    {
        $tier = \App\Models\Tier::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'min_spend' => 'sometimes|numeric',
            'discount_percent' => 'sometimes|numeric',
        ]);
        
        $tier->update($validated);
        
        return response()->json(['message' => 'Tier berhasil diupdate.', 'tier' => $tier]);
    }
}
