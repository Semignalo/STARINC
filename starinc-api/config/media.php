<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Media Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Driver default: 'local' atau 'cloudinary'.
    | Admin bisa override per upload, default ini dipakai bila tidak dispecify.
    |
    */

    'default_driver' => env('MEDIA_DEFAULT_DRIVER', 'local'),

    'drivers' => [

        'local' => [
            'disk' => 'public',
        ],

        'cloudinary' => [
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key'    => env('CLOUDINARY_API_KEY'),
            'api_secret' => env('CLOUDINARY_API_SECRET'),
            'secure'     => true,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Folder Mapping
    |--------------------------------------------------------------------------
    |
    | Lokasi penyimpanan per tipe asset.
    | Cloudinary: dipakai sebagai prefix folder (starinc/{type}/{id}).
    | Local: dipakai sebagai subfolder di disk 'public'.
    |
    */

    'folders' => [
        'products'        => 'starinc/products',
        'payment_proofs'  => 'starinc/payment-proofs',
        'appearance'      => 'starinc/appearance',
        'testimonials'    => 'starinc/testimonials',
        'avatars'         => 'starinc/avatars',
    ],

];
