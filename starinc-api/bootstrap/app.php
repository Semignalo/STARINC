<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // $middleware->statefulApi(); // Disabled because frontend uses stateless Bearer tokens in headers

        // Trust Cloudflare + Nginx reverse proxy. Tanpa ini, Laravel
        // mendeteksi request sebagai HTTP (bukan HTTPS) dan Storage::url()
        // generate URL gambar dengan scheme http:// → mixed content blocked.
        $middleware->trustProxies(at: '*', headers:
            \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_AWS_ELB
        );

        // Global rate limit untuk semua API routes (60 req/min per IP)
        $middleware->api(append: [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':60,1',
            \App\Http\Middleware\CompressResponse::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('app:check-inactive-users')->dailyAt('01:00');
        // Refresh Instagram token tiap Senin pagi (skip kalau >14 hari masih valid)
        $schedule->command('instagram:refresh-token')->weeklyOn(1, '02:00');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

