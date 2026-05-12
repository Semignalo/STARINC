<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StarcenterNetwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NetworkController extends Controller
{
    /**
     * Get referral link and downline network for the authenticated user.
     */
    public function referralInfo(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'starcenter' || $user->role === 'admin') {
            // Starcenter: ambil semua downline hingga 7 level
            $network = StarcenterNetwork::where('upline_id', $user->id)
                ->with(['downline.tier'])
                ->orderBy('depth', 'asc')
                ->get();

            $referrals = $network->map(function ($net) {
                return [
                    'id' => $net->downline->id,
                    'name' => $net->downline->name,
                    'email' => $net->downline->email,
                    'referrer_id' => $net->downline->referrer_id,
                    'tier' => $net->downline->tier,
                    'created_at' => $net->downline->created_at,
                    'cumulative_spending' => $net->downline->cumulative_spending,
                    'level' => $net->depth,
                ];
            });
        } else {
            // Regular user: hanya referral langsung (Level 1)
            $referrals = $user->referrals()
                ->with('tier')
                ->select('id', 'name', 'email', 'referrer_id', 'tier_id', 'created_at', 'cumulative_spending')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ref) {
                    $ref->level = 1;

                    return $ref;
                });
        }

        return response()->json([
            'data' => [
                'referral_code' => $user->referral_code,
                'referral_url' => config('app.frontend_url', 'http://localhost:5173').'/register?ref='.$user->referral_code,
                'total_referrals' => $referrals->count(),
                'referrals' => $referrals,
            ],
        ]);
    }
}
