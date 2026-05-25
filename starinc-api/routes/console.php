<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Nonaktifkan starcenter yang tidak transaksi selama 3 bulan (cek tiap hari 03:00)
Schedule::command('app:check-inactive-users')->dailyAt('03:00');
