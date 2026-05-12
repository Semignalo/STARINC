<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to email.
     */
    public function forgot(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email tidak ditemukan dalam sistem.',
        ]);

        $email = $validated['email'];
        $token = Str::random(64);

        // Store token in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Send email with reset link
        $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($email);

        try {
            Mail::to($email)->send(new ResetPasswordMail($resetUrl));
        } catch (\Exception $e) {
            // If email fails, still return success to avoid user enumeration
            // In production, log this error
        }

        return response()->json([
            'message' => 'Link reset password telah dikirim ke email Anda. Silakan cek email.',
        ]);
    }

    /**
     * Reset password using token.
     */
    public function reset(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email|exists:users,email',
            'token'    => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'email.exists' => 'Email tidak ditemukan dalam sistem.',
        ]);

        $email = $validated['email'];
        $token = $validated['token'];
        $password = $validated['password'];

        // Find reset token record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        // Validate token exists and is not expired (1 hour)
        if (!$resetRecord || !Hash::check($token, $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Token reset password tidak valid atau telah kadaluarsa.'],
            ]);
        }

        $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
        if ($createdAt->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw ValidationException::withMessages([
                'token' => ['Token reset password telah kadaluarsa. Silakan minta link baru.'],
            ]);
        }

        // Update user password
        $user = User::where('email', $email)->first();
        $user->update(['password' => Hash::make($password)]);

        // Delete reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru Anda.',
        ]);
    }
}
