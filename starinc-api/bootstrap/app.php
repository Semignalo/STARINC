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

        // Global rate limit untuk semua API routes (60 req/min per IP)
        $middleware->api(append: [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':60,1',
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('tier:check-downgrades')->dailyAt('00:00');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

