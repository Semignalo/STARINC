<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gzip compression untuk JSON/HTML response.
 * Production: nginx biasanya sudah handle gzip, jadi middleware ini opsional.
 * Dev: berguna untuk testing perilaku produksi.
 */
class CompressResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Skip kalau client tidak support gzip atau sudah encoded
        $acceptEncoding = (string) $request->header('Accept-Encoding', '');
        if (!str_contains($acceptEncoding, 'gzip')) {
            return $response;
        }
        if ($response->headers->has('Content-Encoding')) {
            return $response;
        }

        // Skip kalau bukan response yang bisa di-compress
        $contentType = (string) $response->headers->get('Content-Type', '');
        $compressible = str_contains($contentType, 'application/json')
            || str_contains($contentType, 'text/')
            || str_contains($contentType, 'application/javascript')
            || str_contains($contentType, 'image/svg+xml');
        if (!$compressible) {
            return $response;
        }

        $content = $response->getContent();
        if (!is_string($content) || strlen($content) < 1024) {
            return $response;
        }

        $compressed = gzencode($content, 6);
        if ($compressed === false) {
            return $response;
        }

        $response->setContent($compressed);
        $response->headers->set('Content-Encoding', 'gzip');
        $response->headers->set('Content-Length', (string) strlen($compressed));
        $response->headers->set('Vary', 'Accept-Encoding');

        return $response;
    }
}
