<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Paksa semua URL yang di-generate (Storage::url, asset, route) pakai HTTPS
        // di production. Tanpa ini, behind Cloudflare URL bisa keluar sebagai http://
        // dan browser block sebagai mixed content (gambar tidak tampil).
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
