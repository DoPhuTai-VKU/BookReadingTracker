import os
import pymysql

# Thông tin kết nối MySQL (Mặc định của XAMPP)
DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "book_reading_tracker"

def init_mysql_database():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4'
        )
        with connection.cursor() as cursor:
            # Tạo database nếu chưa có với bảng mã tiếng Việt utf8mb4
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        connection.commit()
        connection.close()
        print(f"[*] Đã kết nối MySQL và đảm bảo database '{DB_NAME}' tồn tại.")
        return True
    except Exception as e:
        print(f"[!] Cảnh báo: Không thể kết nối MySQL XAMPP ({e}).")
        return False

# Cố gắng tạo CSDL MySQL
has_mysql = init_mysql_database()

class Config:
    SECRET_KEY = "do-an-book-reading-tracker-secret-key-2026"

    if has_mysql:
        # Chuỗi kết nối đến MySQL thông qua thư viện PyMySQL
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    else:
        # Nếu MySQL chưa bật, tự động fallback sang SQLite để không bị văng lỗi
        SQLALCHEMY_DATABASE_URI = "sqlite:///book_tracker_fallback.db"
        print("[*] Tự động chuyển sang sử dụng SQLite dự phòng.")

    # Tắt thông báo theo dõi thay đổi để tăng tốc độ ứng dụng
    SQLALCHEMY_TRACK_MODIFICATIONS = False
