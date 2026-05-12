<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    /**
     * Get paginated commission history for the authenticated user.
     */
    public function myCommissions(Request $request): JsonResponse
    {
        $commissions = $request->user()
            ->commissions()
            ->with(['order', 'sourceUser'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($commissions);
    }
}
