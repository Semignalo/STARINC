<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RajaOngkirService
{
    private string $baseUrl;
    private string $apiKey;
    private int $originCityId;

    public function __construct()
    {
        $this->baseUrl    = config('services.rajaongkir.base_url', 'https://api.rajaongkir.com/starter');
        $this->apiKey     = config('services.rajaongkir.api_key') ?? '';
        $this->originCityId = (int) (config('services.rajaongkir.origin_city_id') ?? 501);
    }

    public function getOriginCityId(): int
    {
        return $this->originCityId;
    }

    /**
     * Ambil semua provinsi. Di-cache 24 jam — data jarang berubah.
     */
    public function getProvinces(): array
    {
        if (empty($this->apiKey)) return [];

        return Cache::remember('rajaongkir_provinces', 86400, function () {
            $response = Http::withHeaders(['key' => $this->apiKey])
                ->get("{$this->baseUrl}/province");

            if (! $response->successful()) {
                Log::error('RajaOngkir getProvinces failed', ['status' => $response->status()]);
                return [];
            }

            return $response->json('rajaongkir.results', []);
        });
    }

    /**
     * Ambil kota berdasarkan provinsi. Di-cache 24 jam.
     */
    public function getCities(int $provinceId): array
    {
        if (empty($this->apiKey)) return [];

        return Cache::remember("rajaongkir_cities_{$provinceId}", 86400, function () use ($provinceId) {
            $response = Http::withHeaders(['key' => $this->apiKey])
                ->get("{$this->baseUrl}/city", ['province' => $provinceId]);

            if (! $response->successful()) {
                Log::error('RajaOngkir getCities failed', ['province_id' => $provinceId, 'status' => $response->status()]);
                return [];
            }

            return $response->json('rajaongkir.results', []);
        });
    }

    /**
     * Cek ongkir untuk satu kurir.
     * Return array layanan: [{service, description, cost, etd}]
     *
     * @param  string  $courier  'jne' | 'pos' | 'tiki'
     */
    public function getCost(int $destCityId, int $weightGram, string $courier): array
    {
        if (empty($this->apiKey)) return [];

        $response = Http::withHeaders(['key' => $this->apiKey])
            ->asForm()
            ->post("{$this->baseUrl}/cost", [
                'origin'      => $this->originCityId,
                'destination' => $destCityId,
                'weight'      => max(1, $weightGram),
                'courier'     => $courier,
            ]);

        if (! $response->successful()) {
            Log::error('RajaOngkir getCost failed', [
                'courier' => $courier,
                'dest'    => $destCityId,
                'status'  => $response->status(),
                'body'    => $response->body(),
            ]);
            return [];
        }

        $results = $response->json('rajaongkir.results', []);
        if (empty($results)) {
            return [];
        }

        // Flatten: tiap result punya `costs` array (layanan berbeda per kurir)
        $services = [];
        foreach ($results as $courierResult) {
            $courierCode = strtolower($courierResult['code'] ?? $courier);
            $courierName = $courierResult['name'] ?? strtoupper($courier);

            foreach ($courierResult['costs'] ?? [] as $svc) {
                $services[] = [
                    'courier'     => $courierCode,
                    'courier_name'=> $courierName,
                    'service'     => $svc['service'],
                    'description' => $svc['description'],
                    'cost'        => $svc['cost'][0]['value'] ?? 0,
                    'etd'         => $svc['cost'][0]['etd'] ?? '',
                ];
            }
        }

        return $services;
    }

    /**
     * Ambil ongkir semua kurir Starter (JNE, POS, TIKI) sekaligus.
     * Return array gabungan semua layanan.
     */
    public function getAllCosts(int $destCityId, int $weightGram): array
    {
        $all = [];
        foreach (['jne', 'pos', 'tiki'] as $courier) {
            try {
                $services = $this->getCost($destCityId, $weightGram, $courier);
                $all = array_merge($all, $services);
            } catch (\Exception $e) {
                Log::warning("RajaOngkir getCost error for {$courier}", ['error' => $e->getMessage()]);
            }
        }
        return $all;
    }

    /**
     * Validasi bahwa kombinasi kurir+layanan+biaya yang dikirim frontend sesuai dengan API.
     * Mencegah manipulasi harga ongkir dari frontend.
     * Return biaya valid, atau null jika tidak bisa divalidasi (fallback ke nilai frontend).
     */
    public function validateCost(int $destCityId, int $weightGram, string $courier, string $service): ?int
    {
        try {
            $services = $this->getCost($destCityId, $weightGram, $courier);
            foreach ($services as $svc) {
                if (strtoupper($svc['service']) === strtoupper($service)) {
                    return (int) $svc['cost'];
                }
            }
        } catch (\Exception $e) {
            Log::warning('RajaOngkir validateCost failed', ['error' => $e->getMessage()]);
        }
        return null;
    }
}
