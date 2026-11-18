from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)        
    email = db.Column(db.String(120), unique=True, nullable=False) 
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Quan hệ: 1 User có nhiều Book và nhiều ReadingHistory
    # cascade='all, delete-orphan': Khi xóa user thì tự động xóa hết sách và lịch sử của user đó
    books = db.relationship('Book', backref='user', cascade='all, delete-orphan', lazy=True)
    reading_logs = db.relationship('ReadingHistory', backref='user', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'fullName': self.full_name,
            'email': self.email,
            'createdAt': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else ''
        }


class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(150), nullable=False)       
    category = db.Column(db.String(100), nullable=False)
    total_pages = db.Column(db.Integer, nullable=False)    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Quan hệ: 1 Book có nhiều lần đọc trong ReadingHistory
    reading_logs = db.relationship('ReadingHistory', backref='book', cascade='all, delete-orphan', lazy=True)

    def get_progress(self):
        # Tính tổng số trang từ các bản ghi lịch sử đọc của sách này
        read_pages = sum(log.pages_read for log in self.reading_logs)
        total = self.total_pages if self.total_pages > 0 else 1
        
        # Số trang đã đọc không được vượt quá tổng số trang
        capped_read = min(read_pages, total)
        percent = min(100, round((capped_read / total) * 100))
        status = 'Đã hoàn thành' if capped_read >= total else 'Đang đọc'

        return {
            'readPages': capped_read,
            'rawReadPages': read_pages,
            'totalPages': self.total_pages,
            'percent': percent,
            'status': status
        }

    def to_dict(self):
        progress = self.get_progress()
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'author': self.author,
            'category': self.category,
            'totalPages': self.total_pages,
            'readPages': progress['readPages'],
            'percent': progress['percent'],
            'status': progress['status'],
            'createdAt': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else ''
        }


class ReadingHistory(db.Model):
    __tablename__ = 'reading_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    reading_date = db.Column(db.String(20), nullable=False)
    pages_read = db.Column(db.Integer, nullable=False)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'bookId': self.book_id,
            'bookTitle': self.book.title if self.book else 'Sách đã xóa',
            'readingDate': self.reading_date,
            'pagesRead': self.pages_read,
            'note': self.note or '',
            'createdAt': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else ''
        }
