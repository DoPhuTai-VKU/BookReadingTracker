CREATE DATABASE IF NOT EXISTS `book_reading_tracker` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `book_reading_tracker`;
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên người dùng',
    `email` VARCHAR(120) NOT NULL UNIQUE COMMENT 'Địa chỉ email dùng để đăng nhập',
    `password` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu (đã mã hóa an toàn)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo tài khoản'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `books` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết bảng users',
    `title` VARCHAR(255) NOT NULL COMMENT 'Tên cuốn sách',
    `author` VARCHAR(150) NOT NULL COMMENT 'Tác giả',
    `category` VARCHAR(100) NOT NULL COMMENT 'Thể loại sách',
    `total_pages` INT NOT NULL COMMENT 'Tổng số trang của sách',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày thêm vào tủ sách',
    CONSTRAINT `fk_books_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `reading_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết bảng users',
    `book_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết bảng books',
    `reading_date` VARCHAR(20) NOT NULL COMMENT 'Ngày đọc sách định dạng YYYY-MM-DD',
    `pages_read` INT NOT NULL COMMENT 'Số trang đã đọc trong lần này',
    `note` TEXT NULL COMMENT 'Ghi chú, cảm nghĩ hoặc bài học tâm đắc',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi nhận',
    CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_history_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 1. Thêm tài khoản mẫu
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `created_at`) VALUES
(1, 'Nguyễn Văn Đọc', 'demo@reading.com', 'scrypt:32768:8:1$K5jL7xQy$8f4a13f639cfc1c2ef389025cead721d09e51c863ba900ffcb6b7381bdfbd3d8e578ad4b2c159074ba41113ce73e35ab4b9eb93645b2b2b1ff95f1906c29b71e', NOW())
ON DUPLICATE KEY UPDATE `email` = `email`;

-- 2. Thêm danh sách sách mẫu
INSERT INTO `books` (`id`, `user_id`, `title`, `author`, `category`, `total_pages`, `created_at`) VALUES
(1, 1, 'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ', 'James Clear', 'Phát triển bản thân', 320, NOW()),
(2, 1, 'Nhà Giả Kim (The Alchemist)', 'Paulo Coelho', 'Văn học - Tiểu thuyết', 228, NOW()),
(3, 1, 'Tâm Lý Học Về Tiền (The Psychology of Money)', 'Morgan Housel', 'Kinh tế - Tài chính', 384, NOW()),
(4, 1, 'Clean Code - Nghệ Thuật Viết Code Sạch', 'Robert C. Martin', 'Công nghệ thông tin', 464, NOW()),
(5, 1, 'Cây Cam Ngọt Của Tôi', 'José Mauro de Vasconcelos', 'Văn học - Tiểu thuyết', 244, NOW())
ON DUPLICATE KEY UPDATE `title` = `title`;

-- 3. Thêm lịch sử đọc sách mẫu
INSERT INTO `reading_history` (`id`, `user_id`, `book_id`, `reading_date`, `pages_read`, `note`, `created_at`) VALUES
-- Cuốn Nhà Giả Kim đã đọc hoàn thành 228/228 trang
(1, 1, 2, '2026-10-20', 60, 'Bắt đầu đọc về ước mơ của cậu bé chăn cừu Santiago.', NOW()),
(2, 1, 2, '2026-10-22', 80, 'Cuộc gặp gỡ với vị vua xứ Salem và bài học về vận mệnh cá nhân.', NOW()),
(3, 1, 2, '2026-10-25', 88, 'Kết thúc cuốn sách ở sa mạc và kim tự tháp. Rất xúc động!', NOW()),

-- Cuốn Atomic Habits đã đọc 190/320 trang
(4, 1, 1, '2026-10-27', 45, 'Chương 1: Quy luật 1% mỗi ngày tạo nên thay đổi vĩ đại.', NOW()),
(5, 1, 1, '2026-10-28', 55, 'Bốn quy luật để xây dựng thói quen tốt dễ dàng hơn.', NOW()),
(6, 1, 1, '2026-10-29', 50, 'Thiết kế môi trường xung quanh để kích hoạt thói quen.', NOW()),
(7, 1, 1, '2026-10-31', 40, 'Quy tắc 2 phút để đánh bại thói quen trì hoãn.', NOW()),

-- Cuốn Tâm Lý Học Về Tiền đã đọc 120/384 trang
(8, 1, 3, '2026-11-01', 60, 'Không ai điên rồ cả: góc nhìn thú vị về cách mỗi người quản lý tiền bạc.', NOW()),
(9, 1, 3, '2026-11-02', 60, 'Sức mạnh của lãi kép và sự kiên nhẫn qua thời gian dài.', NOW()),

-- Cuốn Clean Code đã đọc 75/464 trang
(10, 1, 4, '2026-11-03', 75, 'Cách đặt tên biến, hàm có ý nghĩa và quy tắc hàm ngắn gọn.', NOW())
ON DUPLICATE KEY UPDATE `pages_read` = `pages_read`;
