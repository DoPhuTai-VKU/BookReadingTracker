# Book Reading Tracker – Website Theo Dõi Thói Quen Đọc Sách (Front-end)

Dự án Front-end website cá nhân giúp theo dõi tiến độ, quản lý danh sách sách, ghi chép nhật ký đọc sách và trực quan hóa thói quen đọc sách bằng biểu đồ.

---

## 1. Công nghệ sử dụng
- **HTML5**: Cấu trúc giao diện ngữ nghĩa (Semantic HTML5).
- **CSS3**: Bố cục Flexbox, CSS Grid, biến CSS (`:root`), hiệu ứng chuyển động mượt mà và thiết kế Responsive (Mobile, Tablet, Desktop).
- **JavaScript (Vanilla JS)**: Xử lý logic nghiệp vụ, tính toán tiến độ, lọc dữ liệu realtime và tương tác người dùng.
- **Chart.js (CDN)**: Trực quan hóa dữ liệu thống kê bằng biểu đồ cột, biểu đồ tròn (Doughnut) và biểu đồ thanh ngang.
- **Font Awesome 6 (CDN)**: Hệ thống biểu tượng trực quan.
- **localStorage**: Mô phỏng cơ sở dữ liệu và quản lý phiên người dùng (Session).

---

## 2. Cấu trúc thư mục

```
BookReadingTracker/
│
├── index.html                  # Trang điều hướng ban đầu (kiểm tra Auth Guard)
│
├── pages/
│   ├── login.html              # Trang đăng nhập
│   ├── register.html           # Trang đăng ký tài khoản mới
│   ├── dashboard.html          # Trang tổng quan
│   ├── books.html              # Trang quản lý sách cá nhân
│   ├── reading-history.html    # Trang nhật ký lịch sử đọc
│   ├── statistics.html         # Trang thống kê & phân tích biểu đồ
│   └── profile.html            # Trang hồ sơ cá nhân
│
├── css/
│   ├── style.css               # Hệ thống CSS chung, Sidebar, Header, Modal, Toast
│   ├── auth.css                # Giao diện Đăng nhập & Đăng ký
│   ├── dashboard.css           # Thẻ số liệu, biểu đồ tổng quan
│   ├── books.css               # Thẻ sách, thanh tiến độ, bộ lọc
│   ├── reading-history.css     # Bảng nhật ký, bộ lọc ngày & sách
│   ├── statistics.css          # Lưới biểu đồ Chart.js
│   └── profile.css             # Hồ sơ cá nhân, thống kê mini
│
├── js/
│   ├── storage.js              # Tầng trừu tượng StorageService (Repository pattern)
│   ├── data.js                 # Dữ liệu mẫu ban đầu (Mock Data)
│   ├── auth.js                 # Xử lý Đăng nhập, Đăng ký, toggle password
│   ├── main.js                 # App shell, Toast notification, Modal helpers, Logout
│   ├── dashboard.js            # Tính toán chỉ số & vẽ biểu đồ Dashboard
│   ├── books.js                # CRUD sách, tìm kiếm realtime, lọc trạng thái/thể loại
│   ├── reading-history.js      # CRUD lịch sử đọc, ràng buộc nghiệp vụ số trang
│   ├── statistics.js           # 3 biểu đồ Chart.js và chỉ số phân tích chuyên sâu
│   └── profile.js              # Cập nhật thông tin cá nhân
│
└── assets/
    └── images/
```

---

## 3. Tài khoản Demo có sẵn

Khi mở website lần đầu tiên, hệ thống tự động khởi tạo dữ liệu mẫu cho tài khoản thử nghiệm:

- **Email**: `demo@reading.com`
- **Mật khẩu**: `password123`
- *Hoặc bấm nút **"Đăng nhập tài khoản mẫu (Demo)"** tại trang Login để điền và đăng nhập ngay.*

> **Lưu ý về quy tắc phân tách dữ liệu:**  
> Nếu bạn đăng ký một tài khoản mới (ví dụ: `myaccount@test.com`), tài khoản này sẽ hoàn toàn độc lập, có tủ sách và lịch sử đọc riêng rẽ, không dùng chung hay thấy dữ liệu của tài khoản Demo.

---

## 4. Các quy tắc nghiệp vụ đã được triển khai

1. **Ràng buộc số trang đọc**:
   - Số trang đọc mỗi lần bắt buộc là **số nguyên dương (> 0)**.
   - Tổng số trang đã đọc của một cuốn sách **không được vượt quá tổng số trang** của cuốn sách đó.
2. **Tính toán tiến độ tự động**:
   - `Tiến độ (%) = (Tổng số trang đã đọc / Tổng số trang của sách) × 100%`.
   - Khi tiến độ đạt `100%` $\rightarrow$ Trạng thái tự động chuyển thành **"Đã hoàn thành"**.
   - Khi tiến độ `< 100%` $\rightarrow$ Trạng thái là **"Đang đọc"**.
3. **Đồng bộ dữ liệu hai chiều**:
   - Khi thêm, sửa hoặc xóa một bản ghi trong lịch sử đọc, tiến độ sách tương ứng, số liệu Dashboard và biểu đồ Statistics sẽ được tính toán và cập nhật lại đồng bộ.
   - Khi xóa một cuốn sách, các bản ghi lịch sử đọc của cuốn sách đó cũng được dọn sạch để tránh rác dữ liệu.
4. **Auth Guard & Session**:
   - Không cho phép người dùng truy cập các trang quản trị (`pages/*.html`) khi chưa đăng nhập (tự động chuyển hướng về `login.html`).
   - Duy trì đăng nhập khi F5 / tải lại trang qua `localStorage`.
   - Đăng xuất chỉ xóa phiên làm việc (`brt_current_user`), **không làm mất** dữ liệu sách và nhật ký đọc đã lưu.

---

## 5. Hướng dẫn mở và kiểm thử

### Cách 1: Khởi chạy bằng Flask (Khuyên dùng)
1. Cài đặt Flask nếu chưa có:
   ```bash
   pip install -r requirements.txt
   ```
2. Khởi chạy file `app.py`:
   ```bash
   python app.py
   ```
3. Truy cập vào trình duyệt theo đường dẫn:  
   👉 **http://127.0.0.1:5000**

---

### Cách 2: Mở trực tiếp bằng trình duyệt
1. Mở file `index.html` hoặc `pages/login.html` bằng trình duyệt bất kỳ (Google Chrome, Microsoft Edge, Firefox).
2. Hoặc sử dụng extension **Live Server** trong VS Code để trải nghiệm tốt nhất.
2. **Kiểm tra luồng hoạt động**:
   - **Đăng nhập**: Dùng tài khoản Demo hoặc bấm nút "Đăng nhập tài khoản mẫu".
   - **Xem Dashboard**: Quan sát 4 thẻ số liệu, biểu đồ cột các ngày gần đây, danh sách sách đang đọc và nhật ký đọc gần nhất.
   - **Quản lý sách**: Thử thêm sách mới, tìm kiếm theo tên, lọc theo thể loại/trạng thái, sửa thông tin sách.
   - **Ghi nhật ký đọc**: Vào "Lịch sử đọc", thêm một lần đọc mới (chú ý dropdown hiển thị số trang còn lại của sách), kiểm tra validate không cho nhập vượt quá số trang còn lại.
   - **Thống kê**: Kiểm tra 3 biểu đồ trực quan hóa dữ liệu (cột, tròn, thanh ngang).
   - **Hồ sơ**: Sửa họ và tên $\rightarrow$ Tên trên Header và Sidebar được cập nhật ngay lập tức.
   - **Đăng ký tài khoản mới**: Đăng xuất $\rightarrow$ Đăng ký tài khoản mới $\rightarrow$ Kiểm tra tủ sách trống, độc lập hoàn toàn với tài khoản Demo.

---

## 6. Sẵn sàng tích hợp Backend Python Flask + MySQL

Toàn bộ phần gọi dữ liệu đã được trừu tượng hóa gọn gàng trong file `js/storage.js` (`StorageService`).  
Khi xây dựng Backend Flask sau này, bạn chỉ cần thay thế các hàm trong `StorageService` bằng các lời gọi `fetch('/api/...')` hoặc `axios` mà **không cần phải viết lại giao diện**:

| Phương thức StorageService | Endpoint Flask RESTful tương ứng |
|---|---|
| `StorageService.findUserByEmail` / `login` | `POST /api/auth/login` |
| `StorageService.createUser` | `POST /api/auth/register` |
| `StorageService.getBooksByUserId` | `GET /api/books` |
| `StorageService.createBook` | `POST /api/books` |
| `StorageService.updateBook` | `PUT /api/books/<id>` |
| `StorageService.deleteBook` | `DELETE /api/books/<id>` |
| `StorageService.getReadingLogsByUserId` | `GET /api/reading-logs` |
| `StorageService.createReadingLog` | `POST /api/reading-logs` |
