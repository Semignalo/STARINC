<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductMedia;
use Illuminate\Database\Seeder;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'title'       => 'C-STAR',
                'category'    => 'Face Care',
                'description' => "The Portable Antioxidant Masterpiece\nIndonesia's first 26% pure Vitamin C balm stick, engineered for the modern lifestyle to provide immediate protection and an instant luminous glow.\n\n• High-Potency Brightening: A concentrated 26% Vitamin C blend for maximum radiance and superior defense against environmental stressors.\n\n• Dewy Prime Finish: Creates an impeccable makeup base with a luxurious, long-lasting dewy finish.\n\n• Sebum Precision: Intelligently manages surface oils while maintaining optimal deep-tissue hydration for a balanced complexion.",
                'price'       => 285000,
                'stock'       => 997,
                'is_promo'    => false,
                'sort_order'  => 1,
                'main_image'  => 'products/bUACu6IlG1z4Qzq9rqdXI6TdQWoZHyA94uf14Hqb.png',
                'media'       => [
                    ['file_path' => 'products/bUACu6IlG1z4Qzq9rqdXI6TdQWoZHyA94uf14Hqb.png', 'type' => 'image', 'sort_order' => 0],
                    ['file_path' => 'products/f6I9uPkY9USnEUuCGHgDepTUt39Y5gAP3mY1bt1t.jpg', 'type' => 'image', 'sort_order' => 1],
                ],
            ],
            [
                'title'       => 'Confidence Burst',
                'category'    => 'Body Care',
                'description' => "An Icon of Timeless Confidence\nTranscending traditional protection, this serum spray delivers absolute freshness and premium care to keep your skin bright, smooth, and perfectly poised.\n\n• 72-Hour Sophistication: Unrivaled 72-hour odor protection that ensures you remain poised and fresh through every significant moment.\n\n• Advanced Clarifying: Precisely brightens and refines delicate skin areas, delivering an even and aesthetically pleasing skin texture.\n\n• Invisible Shield: A fast-absorbing, transparent formula designed for comfort without leaving a trace on your finest attire.",
                'price'       => 135000,
                'stock'       => 1000,
                'is_promo'    => false,
                'sort_order'  => 2,
                'main_image'  => 'products/i1lPLw2kEnUleOeSK1xubu8R5sB3xaqjqL72QQkE.jpg',
                'media'       => [
                    ['file_path' => 'products/i1lPLw2kEnUleOeSK1xubu8R5sB3xaqjqL72QQkE.jpg', 'type' => 'image', 'sort_order' => 0],
                    ['file_path' => 'products/2QIVvuqbkVM436WnYtimWxaK1csnFefFX7iHDwxs.jpg', 'type' => 'image', 'sort_order' => 1],
                    ['file_path' => 'products/75s6WFpBddpGaSoVW94YKPJA2PdTpywzzVyteA9v.jpg', 'type' => 'image', 'sort_order' => 2],
                ],
            ],
            [
                'title'       => 'Dream Kissed',
                'category'    => 'Body Care',
                'description' => "The Essence of Radiant Skin\nExperience the pinnacle of skin nourishment through an exclusive formula designed to restore vitality and reveal your skin's natural, timeless glow every day.\n\n• Deep Cellular Nutrition: Delivers essential nutrients deep within the skin layers to maintain elasticity and a youthful, healthy appearance.\n\n• Signature Glow: A premium blend of Glutathione and Niacinamide that elegantly brightens and evens skin tone for a flawless finish.\n\n• Velvet Touch: A sophisticated texture that provides instant hydration, leaving a silk-like softness with absolutely no sticky residue.",
                'price'       => 185000,
                'stock'       => 1000,
                'is_promo'    => false,
                'sort_order'  => 3,
                'main_image'  => 'products/WXSSoWfAK71Y1zhb48g3SEeoGD9NjB376EC2vlmr.jpg',
                'media'       => [
                    ['file_path' => 'products/WXSSoWfAK71Y1zhb48g3SEeoGD9NjB376EC2vlmr.jpg', 'type' => 'image', 'sort_order' => 0],
                    ['file_path' => 'products/bczkWPZNtj5Xz4etEVw1BVVIJTrjXdpLyL7maoeV.jpg', 'type' => 'image', 'sort_order' => 1],
                    ['file_path' => 'products/4XUxcecjFpITQFf1DFb3wtwsHUuPhwOULx1LyDec.jpg', 'type' => 'image', 'sort_order' => 2],
                ],
            ],
            [
                'title'       => 'Snow Kissed',
                'category'    => 'Body Care',
                'description' => "The Definition of Luminous Perfection\nIndulge in a transformative brightening experience that bestows an instant, natural radiance while deeply conditioning your skin with an aura of luxury.\n\n• Instant Luminosity: Provides an immediate, natural-looking tone-up effect that seamlessly enhances your skin's original beauty.\n\n• Complexion Refiner: Elegantly blurs imperfections and harmonizes skin tone for a smooth, high-end aesthetic.\n\n• Breathable Hydration: A weightless formula that locks in moisture all day, infused with an enchanting, long-lasting signature fragrance.",
                'price'       => 165000,
                'stock'       => 982,
                'is_promo'    => false,
                'sort_order'  => 4,
                'main_image'  => 'products/Qs2QLVAy25YCKmc8qOgTgi6EpiYvzV7irJTMfwgE.jpg',
                'media'       => [
                    ['file_path' => 'products/Qs2QLVAy25YCKmc8qOgTgi6EpiYvzV7irJTMfwgE.jpg', 'type' => 'image', 'sort_order' => 0],
                    ['file_path' => 'products/IWU5YzBDR9vb43rGG63d7AqK0bhTaSeS5taWyDh8.jpg', 'type' => 'image', 'sort_order' => 1],
                    ['file_path' => 'products/CCJVDMHqRop1gAIQ52GDtcbd7an5qFceYF7nR4Pz.jpg', 'type' => 'image', 'sort_order' => 2],
                ],
            ],
        ];

        foreach ($products as $data) {
            $media = $data['media'];
            unset($data['media']);

            $product = Product::create($data);

            foreach ($media as $m) {
                ProductMedia::create(array_merge($m, ['product_id' => $product->id]));
            }

            $this->command->info("Created: {$product->title}");
        }

        $this->command->info('4 real products seeded.');
    }
}
