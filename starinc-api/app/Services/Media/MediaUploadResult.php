<?php

namespace App\Services\Media;

class MediaUploadResult
{
    public function __construct(
        public readonly string $driver,        // 'local' | 'cloudinary'
        public readonly string $path,          // local: relative path di disk public. cloudinary: public_id
        public readonly string $url,           // URL absolut untuk diakses
        public readonly ?string $publicId = null, // hanya untuk cloudinary
        public readonly ?int $width = null,
        public readonly ?int $height = null,
        public readonly ?int $bytes = null,
        public readonly ?string $format = null,
    ) {}

    public function toArray(): array
    {
        return [
            'driver'    => $this->driver,
            'path'      => $this->path,
            'url'       => $this->url,
            'public_id' => $this->publicId,
            'width'     => $this->width,
            'height'    => $this->height,
            'bytes'     => $this->bytes,
            'format'    => $this->format,
        ];
    }
}
