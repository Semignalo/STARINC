-- Fix product_media: hapus data lama, insert data dari backup dengan product_id yang benar
-- Backup product 1 (C-STAR) → VPS product 4 (C-Star)
-- Backup product 2 (Confidence Burst) → VPS product 3
-- Backup product 3 (Dream Kissed) → VPS product 1
-- Backup product 4 (Snow Kissed) → VPS product 2

DELETE FROM product_media;

INSERT INTO product_media (product_id, file_path, type, sort_order, created_at, updated_at) VALUES
(4, 'products/bUACu6IlG1z4Qzq9rqdXI6TdQWoZHyA94uf14Hqb.png', 'image', 0, NOW(), NOW()),
(4, 'products/f6I9uPkY9USnEUuCGHgDepTUt39Y5gAP3mY1bt1t.jpg', 'image', 1, NOW(), NOW()),
(3, 'products/i1lPLw2kEnUleOeSK1xubu8R5sB3xaqjqL72QQkE.jpg', 'image', 0, NOW(), NOW()),
(3, 'products/2QIVvuqbkVM436WnYtimWxaK1csnFefFX7iHDwxs.jpg', 'image', 1, NOW(), NOW()),
(3, 'products/75s6WFpBddpGaSoVW94YKPJA2PdTpywzzVyteA9v.jpg', 'image', 2, NOW(), NOW()),
(1, 'products/WXSSoWfAK71Y1zhb48g3SEeoGD9NjB376EC2vlmr.jpg', 'image', 0, NOW(), NOW()),
(1, 'products/bczkWPZNtj5Xz4etEVw1BVVIJTrjXdpLyL7maoeV.jpg', 'image', 1, NOW(), NOW()),
(1, 'products/4XUxcecjFpITQFf1DFb3wtwsHUuPhwOULx1LyDec.jpg', 'image', 2, NOW(), NOW()),
(2, 'products/Qs2QLVAy25YCKmc8qOgTgi6EpiYvzV7irJTMfwgE.jpg', 'image', 0, NOW(), NOW()),
(2, 'products/IWU5YzBDR9vb43rGG63d7AqK0bhTaSeS5taWyDh8.jpg', 'image', 1, NOW(), NOW()),
(2, 'products/CCJVDMHqRop1gAIQ52GDtcbd7an5qFceYF7nR4Pz.jpg', 'image', 2, NOW(), NOW());

-- Update main_image di products table
UPDATE products SET main_image = 'products/WXSSoWfAK71Y1zhb48g3SEeoGD9NjB376EC2vlmr.jpg' WHERE id = 1;
UPDATE products SET main_image = 'products/Qs2QLVAy25YCKmc8qOgTgi6EpiYvzV7irJTMfwgE.jpg' WHERE id = 2;
UPDATE products SET main_image = 'products/i1lPLw2kEnUleOeSK1xubu8R5sB3xaqjqL72QQkE.jpg' WHERE id = 3;
UPDATE products SET main_image = 'products/bUACu6IlG1z4Qzq9rqdXI6TdQWoZHyA94uf14Hqb.png' WHERE id = 4;
UPDATE products SET main_image = NULL WHERE id IN (5, 6, 7);
