<?php

namespace Database\Seeders;

use App\Models\AppearanceSetting;
use Illuminate\Database\Seeder;

class AppearanceSeeder extends Seeder
{
    public function run(): void
    {
        $base = 'http://127.0.0.1:8000/storage/appearance/';

        $defaults = [
            'heroVideoUrl'              => $base . 'hsCIwZfkdjtYIfePry7OUXlJaZVpWYnCktbmzP9N.mp4',
            'heroTitle'                 => 'First In Indonesia',
            'heroSubtitle'              => '26% Vit C Serum Stick',
            'logoUrl'                   => '/logo.png',
            'accentColor'               => '#C5A059',
            'primaryColor'              => '#1A1A1A',
            'announcementText'          => 'New Collection 2026',
            'goldSerumVideoUrl'         => $base . 'VXuUmMNGQ92serNXgYVvKw2Hhunfce66HZFrAxuN.mp4',
            'goldSerumSubtitle'         => 'Face cleansing balm',
            'goldSerumDescription1'     => 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.',
            'goldSerumDescription2'     => 'Fragrance-free, lightly scented with ginger and lemon essential oils.',
            'secondFeaturedVideoUrl'    => $base . 'hZEgIFFFg4R72FbXVQsCHbKk1TuGhKF3yY8uTN9O.mp4',
            'secondFeaturedSubtitle'    => 'Our Concept',
            'secondFeaturedDescription1'=> 'A focus on healthy, radiant skin.',
            'secondFeaturedDescription2'=> 'Crafted with passion.',
        ];

        foreach ($defaults as $key => $value) {
            AppearanceSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
