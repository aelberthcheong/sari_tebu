-- AlterTable
-- Menambahkan kolom image_url untuk menyimpan gambar produk (data URL base64
-- atau tautan gambar) supaya katalog POS bisa menampilkan foto produk.
ALTER TABLE `products` ADD COLUMN `image_url` LONGTEXT NULL;
