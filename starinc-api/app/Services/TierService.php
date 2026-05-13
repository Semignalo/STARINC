<?php

namespace App\Services;

// Tier system removed — STARINC menggunakan flat diskon 23% untuk semua starcenter.
// File ini dipertahankan agar tidak memecah referensi di tests lama.

class TierService
{
    public function evaluateUpgrade($user): void {}
    public function checkDowngrades(): void {}
}
