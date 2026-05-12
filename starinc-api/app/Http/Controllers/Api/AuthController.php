<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailMail;
use App\Models\StarcenterNetwork;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        if (! empty($validated['referral_code'])) {
            $referrer = User::where('referral_code', $validated['referral_code'])->first();
            $referrerId = $referrer?->id;
        } else {
            // Default: jadikan downline admin pertama yang ada
            $referrerId = User::where('role', 'admin')->value('id');
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'referrer_id' => $referrerId,
        ]);

        // Populate StarcenterNetwork closure table
        if ($referrerId) {
            // Direct upline (depth 1)
            StarcenterNetwork::create([
                'upline_id' => $referrerId,
                'downline_id' => $user->id,
                'depth' => 1,
            ]);

            // Indirect uplines (depth 2 to 7)
            $uplines = StarcenterNetwork::where('downline_id', $referrerId)->get();
            foreach ($uplines as $upline) {
                if ($upline->depth < 7) {
                    StarcenterNetwork::create([
                        'upline_id' => $upline->upline_id,
                        'downline_id' => $user->id,
                        'depth' => $upline->depth + 1,
                    ]);
                }
            }
        }

        // Send magic link verification email
        try {
            Mail::to($user)->send(new VerifyEmailMail($user));
        } catch (\Throwable $e) {
            Log::error('Registration email failed', ['email' => $user->email, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Cek email Anda untuk verifikasi akun.',
            'email' => $user->email,
        ], 201);
    }

    /**
     * Look up referral code — returns owner name only (public, used on register form).
     */
    public function lookupReferral(string $code)
    {
        $user = User::where('referral_code', strtoupper($code))->first();

        if (! $user) {
            return response()->json(['message' => 'Kode referral tidak ditemukan.'], 404);
        }

        return response()->json(['name' => $user->name]);
    }

    /**
     * Login and get token.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if (! $user->isAdmin() && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email belum diverifikasi. Cek inbox Anda atau minta kirim ulang link verifikasi.',
                'email_unverified' => true,
                'email' => $user->email,
            ], 403);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => $this->userResponse($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * Get current user profile.
     */
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $this->userResponse($request->user()),
        ]);
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $this->userResponse($request->user()->fresh()),
        ]);
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $user->update(['password' => $validated['password']]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    /**
     * Format user response with tier data.
     */
    private function userResponse(User $user): array
    {
        $user->load('tier');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'city' => $user->city,
            'postal_code' => $user->postal_code,
            'role' => $user->role,
            'referral_code' => $user->referral_code,
            'cumulative_spending' => (float) $user->cumulative_spending,
            'last_transaction_at' => $user->last_transaction_at?->toISOString(),
            'created_at' => $user->created_at->toISOString(),
            'tier' => $user->tier ? [
                'slug' => $user->tier->slug,
                'name' => $user->tier->name,
                'discount_percent' => (float) $user->tier->discount_percent,
                'min_spend' => (float) $user->tier->min_spend,
            ] : null,
        ];
    }
}
