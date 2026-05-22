<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Instagram Graph API Configuration
    |--------------------------------------------------------------------------
    |
    | Untuk fetch otomatis 5 post terbaru dari akun Instagram Business/Creator.
    | Bila access_token kosong, frontend akan fallback ke manual input via
    | Appearance Settings.
    |
    | Cara dapat credentials: lihat docs Meta Developer.
    | Long-lived token berlaku 60 hari, perlu di-refresh secara berkala.
    |
    */

    'access_token' => env('INSTAGRAM_ACCESS_TOKEN'),
    'business_id'  => env('INSTAGRAM_BUSINESS_ID'),
    'feed_limit'   => (int) env('INSTAGRAM_FEED_LIMIT', 5),

    // Cache TTL untuk hasil API (menit). Default 30 menit — cukup untuk
    // menghindari hit rate limit (~200 call/jam) tapi tetap fresh.
    'cache_ttl_minutes' => 30,

    // Graph API version. Update bila Meta rilis versi baru.
    'api_version' => 'v21.0',

];
