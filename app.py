"""
app.py - Khởi chạy Front-end Book Reading Tracker bằng Python Flask
File này dùng để chạy máy chủ local và phục vụ giao diện Front-end, 
chưa can thiệp vào logic dữ liệu (dữ liệu vẫn được lưu tại localStorage).
"""

import os
from flask import Flask, send_from_directory

# Khởi tạo ứng dụng Flask với thư mục hiện tại làm thư mục gốc
app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def home():
    """Điều hướng trang chủ về file index.html"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Phục vụ các trang HTML trong pages/ cùng các tài nguyên css, js, assets"""
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = 5000
    print("=" * 60)
    print("   📚 BOOK READING TRACKER - WEBSITE ĐỌC SÁCH (FRONT-END)")
    print(f"   Ứng dụng đang chạy tại: http://127.0.0.1:{port}")
    print("   Nhấn Ctrl + C để dừng máy chủ.")
    print("=" * 60)
    app.run(host='127.0.0.1', port=port, debug=True)
