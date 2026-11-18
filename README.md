# 📚 Book Reading Tracker – Website Theo Dõi Thói Quen Đọc Sách
> **Đồ án môn học / Đồ án tốt nghiệp**: Ứng dụng Web theo dõi tiến độ đọc sách cá nhân, quản lý tủ sách, ghi nhật ký đọc và trực quan hóa thói quen đọc bằng biểu đồ thống kê.

---

## 1. Công nghệ sử dụng trong đồ án

### 🔹 Backend:
- **Ngôn ngữ**: Python 3
- **Framework**: Flask (Micro web framework gọn nhẹ, dễ học, dễ bảo trì)
- **Cơ sở dữ liệu**: MySQL (kết nối qua XAMPP, port 3306, user `root`, password trống)
- **Thư viện ORM**: `Flask-SQLAlchemy` (thao tác CSDL thông qua Class Model trực quan)
- **Driver kết nối MySQL**: `PyMySQL`
- **Bảo mật**: Mã hóa mật khẩu bằng `werkzeug.security` (`generate_password_hash`, `check_password_hash`)
- **Cơ chế dự phòng**: Tự động chuyển sang SQLite nếu MySQL chưa bật.

### 🔹 Front-end:
- **HTML5 & CSS3**: Giao diện chuẩn Semantic, Responsive mượt mà (Mobile, Tablet, Desktop).
- **JavaScript (Vanilla JS)**: Xử lý giao diện và gọi RESTful API bằng `fetch()` bất đồng bộ (`async / await`).
- **Chart.js**: Vẽ 3 biểu đồ thống kê (Cột, Tròn Doughnut, Thanh ngang).
- **Font Awesome 6**: Hệ thống icon trực quan.

---

## 2. Cấu trúc thư mục mã nguồn

```
BookReadingTracker/
│
├── app.py                      # File khởi chạy máy chủ Flask & các RESTful API
├── config.py                   # Cấu hình kết nối MySQL và Secret Key
├── models.py                   # Khai báo các Model (User, Book, ReadingHistory)
├── database.sql                # File SQL tạo bảng và nạp dữ liệu mẫu
├── requirements.txt            # Danh sách các thư viện Python cần thiết
├── index.html                  # Trang điều hướng ban đầu
│
├── pages/
│   ├── login.html              # Trang Đăng nhập
│   ├── register.html           # Trang Đăng ký
│   ├── dashboard.html          # Trang Tổng quan (Dashboard)
│   ├── books.html              # Trang Quản lý sách cá nhân
│   ├── reading-history.html    # Trang Lịch sử đọc sách
│   ├── statistics.html         # Trang Thống kê & Biểu đồ
│   └── profile.html            # Trang Thông tin cá nhân
│
├── css/
│   ├── style.css               # CSS chung (Layout, Sidebar, Modal, Toast)
│   ├── auth.css                # CSS Đăng nhập & Đăng ký
│   ├── dashboard.css           # CSS Dashboard
│   ├── books.css               # CSS Thẻ sách & bộ lọc
│   ├── reading-history.css     # CSS Bảng lịch sử đọc
│   ├── statistics.css          # CSS Lưới biểu đồ
│   └── profile.css             # CSS Hồ sơ cá nhân
│
├── js/
│   ├── storage.js              # Tầng gọi API Backend (fetch API)
│   ├── auth.js                 # Xử lý Đăng ký, Đăng nhập
│   ├── main.js                 # App shell, Toast, Modal, Đăng xuất
│   ├── dashboard.js            # Hiển thị số liệu & biểu đồ Dashboard
│   ├── books.js                # CRUD sách, tìm kiếm, lọc
│   ├── reading-history.js      # CRUD lịch sử đọc, kiểm soát số trang
│   ├── statistics.js           # 3 biểu đồ Chart.js
│   └── profile.js              # Cập nhật thông tin cá nhân
│
└── assets/
    └── images/
```

---

## 3. Sơ đồ cơ sở dữ liệu (Database Schema)

Cơ sở dữ liệu: `book_reading_tracker` gồm 3 bảng quan hệ chặt chẽ:

1. **`users`** (Người dùng):
   - `id`: INT (Khóa chính, tự tăng)
   - `full_name`: VARCHAR(100) (Họ và tên)
   - `email`: VARCHAR(120) (Email đăng nhập - UNIQUE)
   - `password`: VARCHAR(255) (Mật khẩu đã mã hóa an toàn)
   - `created_at`: DATETIME

2. **`books`** (Sách):
   - `id`: INT (Khóa chính, tự tăng)
   - `user_id`: INT (Khóa ngoại $\rightarrow$ `users.id`)
   - `title`: VARCHAR(255) (Tên sách)
   - `author`: VARCHAR(150) (Tác giả)
   - `category`: VARCHAR(100) (Thể loại)
   - `total_pages`: INT (Tổng số trang)
   - `created_at`: DATETIME

3. **`reading_history`** (Lịch sử đọc):
   - `id`: INT (Khóa chính, tự tăng)
   - `user_id`: INT (Khóa ngoại $\rightarrow$ `users.id`)
   - `book_id`: INT (Khóa ngoại $\rightarrow$ `books.id`)
   - `reading_date`: VARCHAR(20) (Ngày đọc, định dạng `YYYY-MM-DD`)
   - `pages_read`: INT (Số trang đã đọc)
   - `note`: TEXT (Ghi chú / cảm nghĩ)
   - `created_at`: DATETIME

---

## 4. Tài khoản Demo có sẵn

Hệ thống đã nạp sẵn tài khoản mẫu để bạn và giảng viên có thể test ngay:
- **Email**: `demo@reading.com`
- **Mật khẩu**: `password123`
*(Hoặc tại trang Login, bấm nút **"Đăng nhập tài khoản mẫu (Demo)"** để điền nhanh).*

---

## 5. Hướng dẫn chạy đồ án

### Bước 1: Bật MySQL trong XAMPP
- Mở **XAMPP Control Panel** và nhấn **Start** tại mục **MySQL** (cổng mặc định 3306).

### Bước 2: Khởi chạy máy chủ Flask
Mở Terminal tại thư mục `BookReadingTracker` và chạy lệnh:
```bash
python app.py
```

Khi chạy, ứng dụng sẽ tự động:
1. Tạo Database `book_reading_tracker` trong MySQL (nếu chưa có).
2. Tạo 3 bảng `users`, `books`, `reading_history`.
3. Nạp sẵn tài khoản Demo và sách mẫu.

### Bước 3: Mở trình duyệt trải nghiệm
Truy cập đường dẫn:  
👉 **http://127.0.0.1:5000**
