-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th8 14, 2025 lúc 06:06 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ns_coating`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `code`, `name`, `description`, `icon`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'pu', 'Sơn PU', 'Sơn Polyurethane cao cấp với độ bền vượt trội', 'fas fa-paint-brush', 1, 1, '2025-08-14 14:10:00', '2025-08-14 14:10:00'),
(2, 'ac', 'Sơn AC', 'Sơn Acrylic chất lượng cao, thân thiện môi trường', 'fas fa-palette', 2, 1, '2025-08-14 14:10:00', '2025-08-14 14:10:00'),
(3, 'nc', 'Sơn NC', 'Sơn Nitrocellulose bóng đẹp, hoàn thiện cao', 'fas fa-spray-can', 3, 1, '2025-08-14 14:10:00', '2025-08-14 14:10:00'),
(4, 'thinner', 'Dung môi', 'Dung môi pha loãng chuyên dụng cho sơn', 'fas fa-flask', 4, 1, '2025-08-14 14:10:00', '2025-08-14 14:10:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(12,0) NOT NULL,
  `original_price` decimal(12,0) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `mixing_ratio` varchar(100) DEFAULT NULL,
  `badge` varchar(20) DEFAULT NULL,
  `in_stock` tinyint(1) DEFAULT 1,
  `stock_quantity` int(11) DEFAULT 0,
  `rating` decimal(2,1) DEFAULT 0.0,
  `review_count` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `category_id`, `description`, `short_description`, `price`, `original_price`, `image`, `features`, `mixing_ratio`, `badge`, `in_stock`, `stock_quantity`, `rating`, `review_count`, `view_count`, `is_featured`, `is_active`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES
(1, 'Sơn PU Trong Suốt Premium', 'son-pu-trong-suot-premium', 1, 'Sơn PU trong suốt cao cấp với độ bền vượt trội, khả năng chống thấm nước tuyệt vời và bề mặt bóng như gương. Thích hợp cho đồ gỗ cao cấp, nội thất sang trọng.', 'Sơn PU trong suốt cao cấp, độ bền vượt trội, chống thấm nước', 450000, NULL, 'images/products/pu-placeholder.svg', '[\"Độ bền cao\", \"Chống thấm\", \"Bóng mirror\", \"Không độc hại\"]', 'PU : Thinner = 2:1', 'new', 1, 50, 4.9, 24, 6, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 16:03:01'),
(2, 'Sơn PU Màu Gỗ Tự Nhiên', 'son-pu-mau-go-tu-nhien', 1, 'Sơn PU với màu gỗ tự nhiên, không độc hại, dễ thi công. Tạo ra bề mặt gỗ đẹp tự nhiên với độ bóng vừa phải.', 'Sơn PU màu gỗ tự nhiên, không độc hại, dễ thi công', 520000, NULL, 'images/products/pu-placeholder.svg', '[\"Màu tự nhiên\", \"Không độc hại\", \"Dễ thi công\", \"Bền màu\"]', 'PU : Thinner = 2:1', '', 1, 35, 5.3, 18, 3, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 16:06:10'),
(3, 'Sơn PU Chống UV Đặc Biệt', 'son-pu-chong-uv-dac-biet', 1, 'Sơn PU chống UV với công nghệ đặc biệt, bảo vệ bề mặt khỏi tác hại của tia UV, không bị phai màu theo thời gian.', 'Sơn PU chống UV đặc biệt, bảo vệ khỏi tia UV', 680000, 816000, 'images/products/pu-placeholder.svg', '[\"Chống UV\", \"Bền màu\", \"Chống phai\", \"Bảo vệ lâu dài\"]', 'PU : Thinner = 2:1', 'sale', 1, 28, 5.1, 31, 0, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:24:13'),
(4, 'Sơn PU 2K Công Nghiệp', 'son-pu-2k-cong-nghiep', 1, 'Sơn PU 2 thành phần dành cho công nghiệp, siêu bền, chống hóa chất. Thích hợp cho các ứng dụng công nghiệp đòi hỏi độ bền cao.', 'Sơn PU 2K công nghiệp, siêu bền, chống hóa chất', 750000, NULL, 'images/products/pu-placeholder.svg', '[\"2 thành phần\", \"Siêu bền\", \"Chống hóa chất\", \"Công nghiệp\"]', 'PU : Thinner = 2:1', '', 1, 20, 5.5, 15, 1, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:32:26'),
(5, 'Sơn AC Ngoại Thất Premium', 'son-ac-ngoai-that-premium', 2, 'Sơn AC ngoại thất cao cấp, chống chịu thời tiết khắc nghiệt, màu bền đẹp, thân thiện với môi trường.', 'Sơn AC ngoại thất cao cấp, chống thời tiết', 320000, NULL, 'images/products/pu-placeholder.svg', '[\"Chống thời tiết\", \"Màu bền\", \"Thân thiện MT\", \"Che phủ tốt\"]', 'AC : Nu?c = 10:1', '', 1, 80, 4.9, 42, 1, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 15:55:01'),
(6, 'Sơn AC Nội Thất Cao Cấp', 'son-ac-noi-that-cao-cap', 2, 'Sơn AC nội thất không mùi, khô nhanh, dễ lau chùi. Tạo bề mặt mịn màng, đẹp mắt cho không gian nội thất.', 'Sơn AC nội thất không mùi, khô nhanh', 280000, NULL, 'images/products/pu-placeholder.svg', '[\"Không mùi\", \"Khô nhanh\", \"Dễ lau chùi\", \"Mịn màng\"]', 'AC : Nu?c = 10:1', 'new', 1, 95, 5.2, 38, 1, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 16:00:57'),
(7, 'Sơn AC Chống Ẩm Mốc', 'son-ac-chong-am-moc', 2, 'Sơn AC chuyên dụng chống ẩm mốc, kháng khuẩn, thích hợp cho vùng khí hậu ẩm ướt, phòng tắm, nhà bếp.', 'Sơn AC chống ẩm mốc, kháng khuẩn', 380000, 456000, 'images/products/pu-placeholder.svg', '[\"Chống ẩm mốc\", \"Kháng khuẩn\", \"Lâu bền\", \"Vùng ẩm ướt\"]', 'AC : Nu?c = 10:1', 'sale', 1, 60, 5.4, 29, 3, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:38:50'),
(8, 'Sơn NC Bóng Gương', 'son-nc-bong-guong', 3, 'Sơn NC bóng cao như gương, màu sắc rực rỡ, độ hoàn thiện cao. Thích hợp cho đồ nội thất cao cấp, xe máy, ô tô.', 'Sơn NC bóng gương, màu sắc đẹp', 420000, NULL, 'images/products/pu-placeholder.svg', '[\"Bóng cao\", \"Màu sắc đẹp\", \"Hoàn thiện cao\", \"Rực rỡ\"]', 'NC : Thinner = 3:1', 'new', 1, 45, 5.3, 33, 2, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 16:01:00'),
(9, 'Sơn NC Metallic', 'son-nc-metallic', 3, 'Sơn NC với hiệu ứng kim loại sang trọng, tạo bề mặt độc đáo, nổi bật. Thích hợp cho các sản phẩm cần tính thẩm mỹ cao.', 'Sơn NC hiệu ứng kim loại sang trọng', 650000, 780000, 'images/products/pu-placeholder.svg', '[\"Hiệu ứng kim loại\", \"Sang trọng\", \"Độc đáo\", \"Thẩm mỹ cao\"]', 'NC : Thinner = 3:1', 'sale', 1, 25, 5.8, 27, 0, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:24:13'),
(10, 'Dung Môi PU Chuyên Dụng', 'dung-moi-pu-chuyen-dung', 4, 'Dung môi chuyên dụng cho sơn PU, độ tinh khiết cao, không tạp chất. Giúp sơn có độ mịn và bóng tốt nhất.', 'Dung môi PU chuyên dụng, độ tinh khiết cao', 85000, NULL, 'images/products/pu-placeholder.svg', '[\"Pha sơn PU\", \"Độ tinh khiết cao\", \"Không tạp chất\", \"Hiệu quả tối ưu\"]', 'S? d?ng tr?c ti?p', '', 1, 120, 4.5, 56, 1, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:33:48'),
(11, 'Dung Môi AC Thường', 'dung-moi-ac-thuong', 4, 'Dung môi cho sơn AC với giá cả hợp lý, chất lượng ổn định. Thích hợp cho các công trình có quy mô lớn.', 'Dung môi AC giá rẻ, chất lượng ổn định', 45000, NULL, 'images/products/pu-placeholder.svg', '[\"Pha sơn AC\", \"Giá rẻ\", \"Chất lượng ổn định\", \"Quy mô lớn\"]', 'S? d?ng tr?c ti?p', 'new', 1, 200, 4.4, 84, 3, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:36:57'),
(12, 'Dung Môi NC Cao Cấp', 'dung-moi-nc-cao-cap', 4, 'Dung môi cao cấp cho sơn NC, chất lượng cao, hiệu quả tốt. Giúp sơn NC đạt độ bóng và màu sắc tốt nhất.', 'Dung môi NC cao cấp, hiệu quả tốt', 120000, NULL, 'images/products/pu-placeholder.svg', '[\"Pha sơn NC\", \"Chất lượng cao\", \"Hiệu quả tốt\", \"Độ bóng cao\"]', 'S? d?ng tr?c ti?p', '', 1, 75, 5.4, 41, 0, 0, 1, NULL, NULL, '2025-08-14 14:10:00', '2025-08-14 14:24:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(200) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_featured` (`is_featured`),
  ADD KEY `idx_price` (`price`);
ALTER TABLE `products` ADD FULLTEXT KEY `idx_search` (`name`,`description`,`short_description`);

--
-- Chỉ mục cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Chỉ mục cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_approved` (`is_approved`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
