<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailMail;
use App\Models\StarcenterNetwork;
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
     * Password default = nomor HP user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|string|email|unique:users',
            'phone'          => 'required|string|max:20',
            'address'        => 'nullable|string|max:500',
            'city'           => 'nullable|string|max:100',
            'postal_code'    => 'nullable|string|max:10',
            'referral_code'  => 'required|string|max:20|exists:users,member_id',
        ], [
            'referral_code.exists' => 'Kode inisiator (SC...) tidak ditemukan.',
        ]);

        $referrer   = User::where('member_id', $validated['referral_code'])->first();
        $referrerId = $referrer->id;

        $user = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'password'       => $validated['phone'],
            'phone'          => $validated['phone'],
            'address'        => $validated['address'] ?? null,
            'city'           => $validated['city'] ?? null,
            'postal_code'    => $validated['postal_code'] ?? null,
            'initiator_name' => $referrer->center_name ?? $referrer->name,
            'referrer_id'    => $referrerId,
        ]);

        StarcenterNetwork::create([
            'upline_id'   => $referrerId,
            'downline_id' => $user->id,
            'depth'       => 1,
        ]);

        try {
            Mail::to($user)->send(new VerifyEmailMail($user));
        } catch (\Throwable $e) {
            Log::error('Registration email failed', ['email' => $user->email, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Cek email Anda untuk verifikasi akun.',
            'email'   => $user->email,
        ], 201);
    }

    /**
     * Look up member_id (SC...) — returns owner name only (public, for register form).
     */
    public function lookupReferral(string $code)
    {
        $user = User::where('member_id', strtoupper($code))->first();

        if (! $user) {
            return response()->json(['message' => 'Kode inisiator tidak ditemukan.'], 404);
        }

        return response()->json([
            'name'        => $user->center_name ?: $user->name,
            'full_name'   => $user->name,
            'member_id'   => $user->member_id,
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
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
                'message'          => 'Email belum diverifikasi. Cek inbox Anda atau minta kirim ulang link verifikasi.',
                'email_unverified' => true,
                'email'            => $user->email,
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'user'    => $this->userResponse($user),
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'user' => $this->userResponse($request->user()),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'center_name'         => 'nullable|string|max:255',
            'nik'                 => 'nullable|string|size:16',
            'birth_date'          => 'nullable|date',
            'phone'               => 'nullable|string|max:20',
            'address'             => 'nullable|string|max:500',
            'city'                => 'nullable|string|max:100',
            'postal_code'         => 'nullable|string|max:10',
            'bank_name'           => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_holder' => 'nullable|string|max:100',
            'bank_branch'         => 'nullable|string|max:100',
            'npwp_number'         => 'nullable|string|max:30',
            'npwp_holder_name'    => 'nullable|string|max:100',
            'ig_account'          => 'nullable|string|max:100',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $this->userResponse($request->user()->fresh()),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
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

    private function userResponse(User $user): array
    {
        return [
            'id'                  => $user->id,
            'member_id'           => $user->member_id,
            'name'                => $user->name,
            'center_name'         => $user->center_name,
            'nik'                 => $user->nik,
            'birth_date'          => $user->birth_date?->toDateString(),
            'email'               => $user->email,
            'phone'               => $user->phone,
            'address'             => $user->address,
            'city'                => $user->city,
            'postal_code'         => $user->postal_code,
            'bank_name'           => $user->bank_name,
            'bank_account_number' => $user->bank_account_number,
            'bank_account_holder' => $user->bank_account_holder,
            'bank_branch'         => $user->bank_branch,
            'npwp_number'         => $user->npwp_number,
            'npwp_holder_name'    => $user->npwp_holder_name,
            'ig_account'          => $user->ig_account,
            'initiator_name'      => $user->initiator_name,
            'role'                => $user->role,
            'status'              => $user->status,
            'referral_code'       => $user->referral_code,
            'cumulative_spending' => (float) $user->cumulative_spending,
            'last_transaction_at' => $user->last_transaction_at?->toISOString(),
            'created_at'          => $user->created_at->toISOString(),
            'discount_percent'    => 23,
        ];
    }
}
