<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\TierSeeder;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(TierSeeder::class);
        \App\Models\SystemSetting::flushCache();
        // Clear rate limiter so throttle middleware doesn't affect tests
        \Illuminate\Support\Facades\RateLimiter::clear('login');
        \Illuminate\Support\Facades\Cache::flush();
    }
}
