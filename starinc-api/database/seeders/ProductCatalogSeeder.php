<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'title'       => 'Dream Kissed – Ultimate Skin Nutrition',
                'category'    => 'Skin & Body Care',
                'description' => "The Essence of Radiant Skin\nExperience the pinnacle of skin nourishment through an exclusive formula designed to restore vitality and reveal your skin's natural, timeless glow every day.\n\n• Deep Cellular Nutrition: Delivers essential nutrients deep within the skin layers to maintain elasticity and a youthful, healthy appearance.\n\n• Signature Glow: A premium blend of Glutathione and Niacinamide that elegantly brightens and evens skin tone for a flawless finish.\n\n• Velvet Touch: A sophisticated texture that provides instant hydration, leaving a silk-like softness with absolutely no sticky residue.",
                'price'       => 75000,
                'is_promo'    => false,
                'sort_order'  => 1,
                'variants'    => [
                    ['name' => '50g – Tube',  'price' => 75000,  'stock' => null],
                    ['name' => '240g – Jar',  'price' => 222500, 'stock' => null],
                ],
            ],
            [
                'title'       => 'Snow Kissed – Tone Up Body Serum',
                'category'    => 'Skin & Body Care',
                'description' => "The Definition of Luminous Perfection\nIndulge in a transformative brightening experience that bestows an instant, natural radiance while deeply conditioning your skin with an aura of luxury.\n\n• Instant Luminosity: Provides an immediate, natural-looking tone-up effect that seamlessly enhances your skin's original beauty.\n\n• Complexion Refiner: Elegantly blurs imperfections and harmonizes skin tone for a smooth, high-end aesthetic.\n\n• Breathable Hydration: A weightless formula that locks in moisture all day, infused with an enchanting, long-lasting signature fragrance.\n\nAvailable in: Seduce & Breeze",
                'price'       => 75000,
                'is_promo'    => false,
                'sort_order'  => 2,
                'variants'    => [
                    ['name' => '50gr',  'price' => 75000,  'stock' => null],
                    ['name' => '100gr', 'price' => 115000, 'stock' => null],
                ],
            ],
            [
                'title'       => 'Confidence Burst – Deodorizer Serum Spray',
                'category'    => 'Skin & Body Care',
                'description' => "An Icon of Timeless Confidence\nTranscending traditional protection, this serum spray delivers absolute freshness and premium care to keep your skin bright, smooth, and perfectly poised.\n\n• 72-Hour Sophistication: Unrivaled 72-hour odor protection that ensures you remain poised and fresh through every significant moment.\n\n• Advanced Clarifying: Precisely brightens and refines delicate skin areas, delivering an even and aesthetically pleasing skin texture.\n\n• Invisible Shield: A fast-absorbing, transparent formula designed for comfort without leaving a trace on your finest attire.",
                'price'       => 162500,
                'weight'      => 60,
                'is_promo'    => false,
                'sort_order'  => 3,
                'variants'    => [],
            ],
            [
                'title'       => 'C-Star – Serum Balm Stick (Vitamin C On The Go)',
                'category'    => 'Skin & Body Care',
                'description' => "The Portable Antioxidant Masterpiece\nIndonesia's first 26% pure Vitamin C balm stick, engineered for the modern lifestyle to provide immediate protection and an instant luminous glow.\n\n• High-Potency Brightening: A concentrated 26% Vitamin C blend for maximum radiance and superior defense against environmental stressors.\n\n• Dewy Prime Finish: Creates an impeccable makeup base with a luxurious, long-lasting dewy finish.\n\n• Sebum Precision: Intelligently manages surface oils while maintaining optimal deep-tissue hydration for a balanced complexion.",
                'price'       => 325500,
                'weight'      => 11,
                'is_promo'    => false,
                'sort_order'  => 4,
                'variants'    => [],
            ],
            [
                'title'       => 'Collastar – Premium Collagen Drink',
                'category'    => 'Health & Beauty Supplement',
                'description' => "The Elixir of Inner Youth\nA refined internal beauty ritual blending the world's most precious ingredients to restore the structure, firmness, and elasticity of your skin from within.\n\n• Triple-Action Renewal: A revolutionary synergy of Tripeptide Collagen, Saffron, and Bird's Nest for profound skin regeneration.\n\n• Internal Radiance: Premium L-Glutathione that purifies and illuminates your skin's aura directly at the cellular level.\n\n• Holistic Elegance: Comprehensive nutrition that supports cardiovascular health while preserving an eternal youthful glow.\n\nAvailable in: Honey & Mixfruit",
                'price'       => 144500,
                'is_promo'    => false,
                'sort_order'  => 5,
                'variants'    => [
                    ['name' => '5 Pcs – 75gr',   'price' => 144500, 'stock' => null],
                    ['name' => '15 Pcs – 225gr',  'price' => 367500, 'stock' => null],
                ],
            ],
            [
                'title'       => 'KickFatt – Fat Burner & Detox Serum',
                'category'    => 'Body Sculpting Care',
                'description' => "The Precision Body Sculptor\nA revolutionary topical serum meticulously designed to define your silhouette with advanced and intensive fat-burning technology.\n\n• Thermal Sculpting: Powered by Pink Pepperslim technology to intelligently target and reduce stubborn fat in desired areas.\n\n• Textural Refining: Effectively diminishes the appearance of cellulite and tightens skin tissues for a smoother, firmer silhouette.\n\n• Luxurious Botanical Infusion: Enriched with Pomegranate and Jojoba oils to deeply nourish the skin throughout the detoxification process.",
                'price'       => 150500,
                'is_promo'    => false,
                'sort_order'  => 6,
                'variants'    => [
                    ['name' => '5 Pcs – 75gr',   'price' => 150500, 'stock' => null],
                    ['name' => '15 Pcs – 225gr',  'price' => 383500, 'stock' => null],
                ],
            ],
            [
                'title'       => 'PrimeHerb – Holistic Health & Vitality',
                'category'    => 'Supreme Health Supplement',
                'description' => "The Essence of Supreme Vitality\nA perfect balance of ancient herbal wisdom and modern science, crafted to provide unshakable energy, stamina, and immune resilience.\n\n• Immunity Fortress: A potent combination of Saffron and Habbatussauda to build a comprehensive natural defense for the body.\n\n• Regenerative Power: Accelerates cellular repair and revitalizes energy levels for peak daily performance and productivity.\n\n• Pure Botanical Synergy: Utilizing premium Korean Ginseng and Fig (Ara) extracts in vegan capsules for ultimate holistic wellness.",
                'price'       => 393500,
                'is_promo'    => false,
                'sort_order'  => 7,
                'variants'    => [
                    ['name' => '30 Caps', 'price' => 393500, 'stock' => null],
                    ['name' => '60 Caps', 'price' => 603500, 'stock' => null],
                ],
            ],
        ];

        foreach ($products as $data) {
            $variants = $data['variants'];
            unset($data['variants']);

            // Use lowest variant price as base price
            if (!empty($variants)) {
                $data['price'] = min(array_column($variants, 'price'));
            }

            $product = Product::create($data);

            foreach ($variants as $variant) {
                $product->variants()->create($variant);
            }

            $this->command->info("Created: {$product->title}");
        }

        $this->command->info('All 7 products seeded successfully.');
    }
}
