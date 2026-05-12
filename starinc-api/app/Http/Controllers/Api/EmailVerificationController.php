<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailVerificationController extends Controller
{
    /**
     * Verify email via magic link (signed URL from email).
     * User clicks this link from their email — no auth required, signature validates instead.
     */
    public function verify(Request $request, int $id, string $hash)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $user = User::find($id);

        if (! $user) {
            return redirect($frontendUrl.'/verify-email?error=invalid');
        }

        if (! $request->hasValidSignature()) {
            return redirect($frontendUrl.'/verify-email?error=expired&email='.urlencode($user->email));
        }

        if (! hash_equals(sha1($user->email), $hash)) {
            return redirect($frontendUrl.'/verify-email?error=invalid');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($frontendUrl.'/login?verified=already');
        }

        $user->email_verified_at = now();
        $user->save();

        return redirect($frontendUrl.'/login?verified=1');
    }

    /**
     * Resend verification email (public — similar to forgot-password pattern).
     * Throttled to prevent abuse. Always returns 200 to prevent email enumeration.
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Silently succeed if user not found or already verified (prevent enumeration)
        if ($user && ! $user->hasVerifiedEmail()) {
            try {
                Mail::to($user)->send(new VerifyEmailMail($user));
            } catch (\Throwable $e) {
                Log::error('Resend verification email failed', ['email' => $request->email, 'error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => 'Jika email terdaftar dan belum diverifikasi, link verifikasi telah dikirim.',
        ]);
    }
}
