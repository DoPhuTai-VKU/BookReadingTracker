import os
from datetime import datetime
from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from models import db, User, Book, ReadingHistory

# Khởi tạo ứng dụng Flask với thư mục tĩnh là thư mục hiện tại
app = Flask(__name__, static_folder='.', static_url_path='')
app.config.from_object(Config)

# Kết nối cơ sở dữ liệu với Flask App
db.init_app(app)


def get_current_user_id():
    user_id = session.get('user_id')
    if not user_id:
        header_id = request.headers.get('X-User-Id')
        if header_id and header_id.isdigit():
            user_id = int(header_id)
    return user_id


def seed_demo_data():
    if User.query.first():
        return

    print("[*] Đang khởi tạo dữ liệu mẫu cho tài khoản Demo...")

    # 1. Tạo người dùng demo
    demo_user = User(
        full_name='Nguyễn Văn Đọc',
        email='demo@reading.com',
        password=generate_password_hash('password123'),
        created_at=datetime.utcnow()
    )
    db.session.add(demo_user)
    db.session.flush()  # Lấy ID của demo_user vừa tạo

    # 2. Tạo 5 cuốn sách mẫu
    books_data = [
        Book(user_id=demo_user.id, title='Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ', author='James Clear', category='Phát triển bản thân', total_pages=320),
        Book(user_id=demo_user.id, title='Nhà Giả Kim (The Alchemist)', author='Paulo Coelho', category='Văn học - Tiểu thuyết', total_pages=228),
        Book(user_id=demo_user.id, title='Tâm Lý Học Về Tiền (The Psychology of Money)', author='Morgan Housel', category='Kinh tế - Tài chính', total_pages=384),
        Book(user_id=demo_user.id, title='Clean Code - Nghệ Thuật Viết Code Sạch', author='Robert C. Martin', category='Công nghệ thông tin', total_pages=464),
        Book(user_id=demo_user.id, title='Cây Cam Ngọt Của Tôi', author='José Mauro de Vasconcelos', category='Văn học - Tiểu thuyết', total_pages=244),
    ]
    db.session.add_all(books_data)
    db.session.flush()

    # 3. Tạo lịch sử đọc mẫu
    # Cuốn 2: Nhà Giả Kim - Đã hoàn thành (228/228)
    logs_data = [
        ReadingHistory(user_id=demo_user.id, book_id=books_data[1].id, reading_date='2026-10-20', pages_read=60, note='Bắt đầu đọc về ước mơ của cậu bé chăn cừu Santiago.'),
        ReadingHistory(user_id=demo_user.id, book_id=books_data[1].id, reading_date='2026-10-22', pages_read=80, note='Cuộc gặp gỡ với vị vua xứ Salem và bài học về vận mệnh cá nhân.'),
        ReadingHistory(user_id=demo_user.id, book_id=books_data[1].id, reading_date='2026-10-25', pages_read=88, note='Kết thúc cuốn sách ở sa mạc và kim tự tháp. Rất xúc động!'),

        # Cuốn 1: Atomic Habits - Đang đọc (190/320)
        ReadingHistory(user_id=demo_user.id, book_id=books_data[0].id, reading_date='2026-10-27', pages_read=45, note='Chương 1: Quy luật 1% mỗi ngày tạo nên thay đổi vĩ đại.'),
        ReadingHistory(user_id=demo_user.id, book_id=books_data[0].id, reading_date='2026-10-28', pages_read=55, note='Bốn quy luật để xây dựng thói quen tốt dễ dàng hơn.'),
        ReadingHistory(user_id=demo_user.id, book_id=books_data[0].id, reading_date='2026-10-29', pages_read=50, note='Thiết kế môi trường xung quanh để kích hoạt thói quen.'),
        ReadingHistory(user_id=demo_user.id, book_id=books_data[0].id, reading_date='2026-10-31', pages_read=40, note='Quy tắc 2 phút để đánh bại thói quen trì hoãn.'),

        # Cuốn 3: Tâm Lý Học Về Tiền - Đang đọc (120/384)
        ReadingHistory(user_id=demo_user.id, book_id=books_data[2].id, reading_date='2026-11-01', pages_read=60, note='Không ai điên rồ cả: góc nhìn thú vị về cách mỗi người quản lý tiền bạc.'),
        ReadingHistory(user_id=demo_user.id, book_id=books_data[2].id, reading_date='2026-11-02', pages_read=60, note='Sức mạnh của lãi kép và sự kiên nhẫn qua thời gian dài.'),

        # Cuốn 4: Clean Code - Đang đọc (75/464)
        ReadingHistory(user_id=demo_user.id, book_id=books_data[3].id, reading_date='2026-11-03', pages_read=75, note='Cách đặt tên biến, hàm có ý nghĩa và quy tắc hàm ngắn gọn.')
    ]
    db.session.add_all(logs_data)
    db.session.commit()
    print("[*] Khởi tạo dữ liệu mẫu thành công!")


# =============================================================================
# 1. API XÁC THỰC TÀI KHOẢN (AUTHENTICATION)
# =============================================================================

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    """Đăng ký tài khoản mới"""
    data = request.get_json() or {}
    full_name = data.get('fullName', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # 1. Kiểm tra các trường bắt buộc
    if not full_name or not email or not password:
        return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ tất cả các trường!'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Mật khẩu phải có ít nhất 6 ký tự!'}), 400

    # 2. Kiểm tra email đã tồn tại hay chưa
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email này đã được đăng ký tài khoản khác!'}), 400

    # 3. Mã hóa mật khẩu và lưu vào CSDL
    hashed_password = generate_password_hash(password)
    new_user = User(full_name=full_name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
        'user': new_user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """Đăng nhập tài khoản"""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Vui lòng nhập email và mật khẩu!'}), 400

    # Tìm user theo email
    user = User.query.filter_by(email=email).first()

    # So khớp mật khẩu đã mã hóa (hoặc mật khẩu thường nếu có)
    if not user or not (check_password_hash(user.password, password) or user.password == password):
        return jsonify({'success': False, 'message': 'Email hoặc mật khẩu không chính xác!'}), 401

    # Lưu session người dùng
    session['user_id'] = user.id

    return jsonify({
        'success': True,
        'message': 'Đăng nhập thành công!',
        'user': user.to_dict()
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    """Đăng xuất tài khoản"""
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Đã đăng xuất thành công!'}), 200


@app.route('/api/auth/me', methods=['GET'])
def api_get_me():
    """Lấy thông tin người dùng đang đăng nhập"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'Không tìm thấy người dùng!'}), 404

    return jsonify({'success': True, 'user': user.to_dict()}), 200


@app.route('/api/auth/profile', methods=['PUT'])
def api_update_profile():
    """Cập nhật thông tin cá nhân (Họ và tên)"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'Người dùng không tồn tại!'}), 404

    data = request.get_json() or {}
    new_name = data.get('fullName', '').strip()

    if not new_name or len(new_name) < 2:
        return jsonify({'success': False, 'message': 'Họ và tên phải có ít nhất 2 ký tự!'}), 400

    user.full_name = new_name
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Cập nhật thông tin cá nhân thành công!',
        'user': user.to_dict()
    }), 200


# =============================================================================
# 2. API QUẢN LÝ SÁCH (BOOKS CRUD)
# =============================================================================

@app.route('/api/books', methods=['GET'])
def api_get_books():
    """Lấy danh sách sách của tài khoản đang đăng nhập"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    books = Book.query.filter_by(user_id=user_id).order_by(Book.id.desc()).all()
    return jsonify({
        'success': True,
        'books': [book.to_dict() for book in books]
    }), 200


@app.route('/api/books', methods=['POST'])
def api_create_book():
    """Thêm cuốn sách mới vào tủ sách"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    category = data.get('category', '').strip()
    try:
        total_pages = int(data.get('totalPages', 0))
    except (ValueError, TypeError):
        total_pages = 0

    # Kiểm tra tính hợp lệ
    if not title or not author or not category:
        return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ Tên sách, Tác giả và Thể loại!'}), 400

    if total_pages <= 0:
        return jsonify({'success': False, 'message': 'Tổng số trang phải là số nguyên dương lớn hơn 0!'}), 400

    new_book = Book(
        user_id=user_id,
        title=title,
        author=author,
        category=category,
        total_pages=total_pages
    )
    db.session.add(new_book)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Đã thêm cuốn sách "{new_book.title}" thành công!',
        'book': new_book.to_dict()
    }), 201


@app.route('/api/books/<int:book_id>', methods=['PUT'])
def api_update_book(book_id):
    """Chỉnh sửa thông tin một cuốn sách"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    # Chỉ được sửa sách thuộc sở hữu của chính user này
    book = Book.query.filter_by(id=book_id, user_id=user_id).first()
    if not book:
        return jsonify({'success': False, 'message': 'Không tìm thấy cuốn sách này!'}), 404

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    category = data.get('category', '').strip()
    try:
        total_pages = int(data.get('totalPages', book.total_pages))
    except (ValueError, TypeError):
        total_pages = book.total_pages

    if not title or not author or not category:
        return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ thông tin!'}), 400

    if total_pages <= 0:
        return jsonify({'success': False, 'message': 'Tổng số trang phải lớn hơn 0!'}), 400

    book.title = title
    book.author = author
    book.category = category
    book.total_pages = total_pages
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Đã cập nhật cuốn sách "{book.title}" thành công!',
        'book': book.to_dict()
    }), 200


@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def api_delete_book(book_id):
    """Xóa cuốn sách và toàn bộ lịch sử đọc của cuốn sách đó"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    book = Book.query.filter_by(id=book_id, user_id=user_id).first()
    if not book:
        return jsonify({'success': False, 'message': 'Không tìm thấy cuốn sách này!'}), 404

    book_title = book.title
    db.session.delete(book)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Đã xóa cuốn sách "{book_title}" thành công!'
    }), 200


# =============================================================================
# 3. API NHẬT KÝ LỊCH SỬ ĐỌC (READING HISTORY CRUD)
# =============================================================================

@app.route('/api/reading-history', methods=['GET'])
def api_get_reading_history():
    """Lấy danh sách các lần đọc sách của user"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    logs = ReadingHistory.query.filter_by(user_id=user_id).order_by(ReadingHistory.reading_date.desc(), ReadingHistory.id.desc()).all()
    return jsonify({
        'success': True,
        'history': [log.to_dict() for log in logs]
    }), 200


@app.route('/api/reading-history', methods=['POST'])
def api_create_reading_log():
    """Ghi nhận một lần đọc sách mới"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    data = request.get_json() or {}
    try:
        book_id = int(data.get('bookId'))
        pages_read = int(data.get('pagesRead'))
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Thông tin cuốn sách hoặc số trang không hợp lệ!'}), 400

    reading_date = data.get('readingDate', '').strip()
    note = data.get('note', '').strip()

    if not reading_date:
        return jsonify({'success': False, 'message': 'Vui lòng chọn ngày đọc!'}), 400

    # Quy tắc nghiệp vụ 1: Số trang phải là số nguyên dương > 0
    if pages_read <= 0:
        return jsonify({'success': False, 'message': 'Số trang đọc phải là số nguyên dương lớn hơn 0!'}), 400

    # Kiểm tra sách có thuộc user không
    book = Book.query.filter_by(id=book_id, user_id=user_id).first()
    if not book:
        return jsonify({'success': False, 'message': 'Cuốn sách này không tồn tại trong tủ sách của bạn!'}), 404

    # Quy tắc nghiệp vụ 2: Số trang đọc không được vượt quá số trang còn lại của sách
    current_progress = book.get_progress()
    remaining_pages = book.total_pages - current_progress['readPages']

    if pages_read > remaining_pages:
        return jsonify({
            'success': False,
            'message': f'Số trang đọc ({pages_read} trang) vượt quá số trang còn lại ({remaining_pages} trang) của cuốn sách!'
        }), 400

    new_log = ReadingHistory(
        user_id=user_id,
        book_id=book_id,
        reading_date=reading_date,
        pages_read=pages_read,
        note=note
    )
    db.session.add(new_log)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Đã ghi nhận +{pages_read} trang cho cuốn sách "{book.title}"!',
        'log': new_log.to_dict()
    }), 201


@app.route('/api/reading-history/<int:log_id>', methods=['PUT'])
def api_update_reading_log(log_id):
    """Chỉnh sửa một bản ghi lịch sử đọc"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    log = ReadingHistory.query.filter_by(id=log_id, user_id=user_id).first()
    if not log:
        return jsonify({'success': False, 'message': 'Không tìm thấy bản ghi này!'}), 404

    data = request.get_json() or {}
    try:
        new_pages_read = int(data.get('pagesRead'))
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Số trang không hợp lệ!'}), 400

    reading_date = data.get('readingDate', log.reading_date).strip()
    note = data.get('note', log.note or '').strip()

    if new_pages_read <= 0:
        return jsonify({'success': False, 'message': 'Số trang đọc phải là số nguyên dương lớn hơn 0!'}), 400

    # Kiểm tra tổng số trang sau khi sửa không vượt quá tổng trang của sách
    book = log.book
    total_pages_other_logs = sum(l.pages_read for l in book.reading_logs if l.id != log.id)
    max_allowed = book.total_pages - total_pages_other_logs

    if new_pages_read > max_allowed:
        return jsonify({
            'success': False,
            'message': f'Tổng số trang đọc sẽ vượt quá tổng số trang của sách! Tối đa bạn chỉ có thể nhập {max_allowed} trang.'
        }), 400

    log.pages_read = new_pages_read
    log.reading_date = reading_date
    log.note = note
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Đã cập nhật bản ghi lịch sử đọc thành công!',
        'log': log.to_dict()
    }), 200


@app.route('/api/reading-history/<int:log_id>', methods=['DELETE'])
def api_delete_reading_log(log_id):
    """Xóa một bản ghi lịch sử đọc"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    log = ReadingHistory.query.filter_by(id=log_id, user_id=user_id).first()
    if not log:
        return jsonify({'success': False, 'message': 'Không tìm thấy bản ghi này!'}), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Đã xóa bản ghi lịch sử đọc thành công!'
    }), 200


# =============================================================================
# 4. API THỐNG KÊ (DASHBOARD & STATISTICS)
# =============================================================================

@app.route('/api/dashboard/stats', methods=['GET'])
def api_dashboard_stats():
    """Trả về toàn bộ số liệu thống kê cho trang Dashboard của user hiện tại"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    books = Book.query.filter_by(user_id=user_id).all()
    logs = ReadingHistory.query.filter_by(user_id=user_id).order_by(ReadingHistory.reading_date.desc(), ReadingHistory.id.desc()).all()

    total_books = len(books)
    completed_books = sum(1 for b in books if b.get_progress()['status'] == 'Đã hoàn thành')
    total_pages_read = sum(log.pages_read for log in logs)
    unique_days = len(set(log.reading_date for log in logs))

    # Top sách đang đọc
    currently_reading = [b.to_dict() for b in books if b.get_progress()['status'] == 'Đang đọc'][:4]

    # 5 hoạt động gần nhất
    recent_logs = [log.to_dict() for log in logs[:5]]

    return jsonify({
        'success': True,
        'stats': {
            'totalBooks': total_books,
            'completedBooks': completed_books,
            'totalPagesRead': total_pages_read,
            'uniqueReadingDays': unique_days,
            'currentlyReading': currently_reading,
            'recentLogs': recent_logs
        }
    }), 200


@app.route('/api/statistics', methods=['GET'])
def api_detailed_statistics():
    """Trả về dữ liệu phân tích chuyên sâu cho 3 biểu đồ trên trang Statistics"""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập!'}), 401

    books = Book.query.filter_by(user_id=user_id).all()
    logs = ReadingHistory.query.filter_by(user_id=user_id).order_by(ReadingHistory.reading_date.asc()).all()

    total_pages_read = sum(log.pages_read for log in logs)
    unique_days = len(set(log.reading_date for log in logs))
    avg_pages = round(total_pages_read / unique_days) if unique_days > 0 else 0
    completion_rate = round((sum(1 for b in books if b.get_progress()['status'] == 'Đã hoàn thành') / len(books)) * 100) if books else 0

    # 1. Gom nhóm số trang theo từng ngày
    pages_by_date = {}
    for log in logs:
        pages_by_date[log.reading_date] = pages_by_date.get(log.reading_date, 0) + log.pages_read

    # 2. Gom nhóm sách theo thể loại
    category_count = {}
    for b in books:
        cat = b.category or 'Khác'
        category_count[cat] = category_count.get(cat, 0) + 1

    # 3. Tiến độ từng cuốn sách
    book_progress_list = [
        {
            'id': b.id,
            'title': b.title,
            'percent': b.get_progress()['percent'],
            'readPages': b.get_progress()['readPages'],
            'totalPages': b.total_pages
        }
        for b in books
    ]

    return jsonify({
        'success': True,
        'summary': {
            'totalPagesRead': total_pages_read,
            'avgPagesPerDay': avg_pages,
            'uniqueReadingDays': unique_days,
            'completionRate': completion_rate
        },
        'charts': {
            'pagesByDate': pages_by_date,
            'categories': category_count,
            'bookProgress': book_progress_list
        }
    }), 200


# =============================================================================
# 5. ĐIỀU HƯỚNG & PHỤC VỤ CÁC FILE GIAO DIỆN FRONT-END (HTML, CSS, JS)
# =============================================================================

@app.route('/')
def home():
    """Trang chủ chuyển hướng về index.html"""
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Phục vụ các file trong pages/, css/, js/, assets/"""
    return send_from_directory('.', path)


# =============================================================================
# KHỞI CHẠY CHƯƠNG TRÌNH
# =============================================================================

if __name__ == '__main__':
    # Tạo các bảng trong CSDL nếu chưa có
    with app.app_context():
        db.create_all()
        seed_demo_data()

    port = 5000
    print("=" * 65)
    print("   📚 BOOK READING TRACKER - FLASK BACKEND + MYSQL (ĐỒ ÁN)")
    print(f"   Ứng dụng đang chạy tại: http://127.0.0.1:{port}")
    print("   Tài khoản Demo sẵn có: demo@reading.com / password123")
    print("   Bấm Ctrl + C để dừng máy chủ.")
    print("=" * 65)
    app.run(host='127.0.0.1', port=port, debug=True)
