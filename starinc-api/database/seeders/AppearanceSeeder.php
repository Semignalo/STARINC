<?php

namespace Database\Seeders;

use App\Models\AppearanceSetting;
use Illuminate\Database\Seeder;

class AppearanceSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'heroVideoUrl'               => 'https://cdn.pixabay.com/video/2023/10/22/186175-877661556_large.mp4',
            'heroTitle'                   => 'True Radiance',
            'heroSubtitle'                => 'Discover the new Gold Standard for your skin.',
            'logoUrl'                     => '/logo.png',
            'accentColor'                 => '#C5A059',
            'goldSerumVideoUrl'           => '',
            'goldSerumSubtitle'           => 'Face cleansing balm',
            'goldSerumDescription1'       => 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.',
            'goldSerumDescription2'       => 'Fragrance-free, lightly scented with ginger and lemon essential oils.',
            'secondFeaturedVideoUrl'      => '',
            'secondFeaturedSubtitle'      => 'Our Concept',
            'secondFeaturedDescription1'  => 'A focus on healthy, radiant skin.',
            'secondFeaturedDescription2'  => 'Crafted with passion.',
        ];

        foreach ($defaults as $key => $value) {
            AppearanceSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
