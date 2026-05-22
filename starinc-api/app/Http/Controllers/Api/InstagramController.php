<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InstagramService;
use Illuminate\Http\Request;

class InstagramController extends Controller
{
    public function __construct(private InstagramService $instagram) {}

    /**
     * Public: 5 post terbaru untuk section IG di homepage.
     */
    public function posts(Request $request)
    {
        $limit = (int) $request->query('limit', config('instagram.feed_limit', 5));
        $limit = max(1, min($limit, 25));

        return response()->json([
            'configured' => $this->instagram->isConfigured(),
            'posts'      => $this->instagram->latestPosts($limit),
        ]);
    }

    /**
     * Admin: paksa refresh cache + return post terbaru.
     */
    public function refresh()
    {
        return response()->json([
            'configured' => $this->instagram->isConfigured(),
            'posts'      => $this->instagram->forceRefresh(),
        ]);
    }

    /**
     * Admin: validasi access token (untuk status di admin Appearance).
     */
    public function status()
    {
        $validation = $this->instagram->validateToken();
        return response()->json([
            'configured' => $this->instagram->isConfigured(),
            ...$validation,
        ]);
    }

    /**
     * Admin: refresh Instagram Login token (perpanjang 60 hari).
     */
    public function refreshToken()
    {
        $result = $this->instagram->refreshToken();
        return response()->json($result, $result['ok'] ? 200 : 422);
    }
}
