const StorageService = {
    // ==========================================
    // 1. QUẢN LÝ PHIÊN ĐĂNG NHẬP (SESSION)
    // ==========================================
    getCurrentUser() {
        try {
            const data = localStorage.getItem('brt_current_user');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem('brt_current_user');
        } else {
            localStorage.setItem('brt_current_user', JSON.stringify(user));
        }
    },

    clearSession() {
        localStorage.removeItem('brt_current_user');
    },

    // Hàm tiện ích tạo header cho các yêu cầu fetch
    _getHeaders() {
        const currentUser = this.getCurrentUser();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (currentUser && currentUser.id) {
            headers['X-User-Id'] = currentUser.id.toString();
        }
        return headers;
    },

    // ==========================================
    // 2. CÁC API XÁC THỰC (AUTH API)
    // ==========================================
    async login(email, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                this.setCurrentUser(data.user);
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            return { success: False, message: 'Không thể kết nối đến máy chủ Flask!' };
        }
    },

    async register(fullName, email, password) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fullName, email, password })
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            return { success: False, message: 'Không thể kết nối đến máy chủ Flask!' };
        }
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        } finally {
            this.clearSession();
        }
    },

    async updateProfile(fullName) {
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: this._getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ fullName })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                this.setCurrentUser(data.user);
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi cập nhật profile:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    // ==========================================
    // 3. CÁC API QUẢN LÝ SÁCH (BOOK API)
    // ==========================================
    async getBooks() {
        try {
            const res = await fetch('/api/books', {
                method: 'GET',
                headers: this._getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            return data.success ? data.books : [];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sách:', error);
            return [];
        }
    },

    async createBook(bookData) {
        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: this._getHeaders(),
                credentials: 'include',
                body: JSON.stringify(bookData)
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi thêm sách:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    async updateBook(bookId, bookData) {
        try {
            const res = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: this._getHeaders(),
                credentials: 'include',
                body: JSON.stringify(bookData)
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi sửa sách:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    async deleteBook(bookId) {
        try {
            const res = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: this._getHeaders(),
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi xóa sách:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    // ==========================================
    // 4. CÁC API NHẬT KÝ ĐỌC SÁCH 
    // ==========================================
    async getReadingHistory() {
        try {
            const res = await fetch('/api/reading-history', {
                method: 'GET',
                headers: this._getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            return data.success ? data.history : [];
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử đọc:', error);
            return [];
        }
    },

    async createReadingLog(logData) {
        try {
            const res = await fetch('/api/reading-history', {
                method: 'POST',
                headers: this._getHeaders(),
                credentials: 'include',
                body: JSON.stringify(logData)
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi ghi nhận đọc sách:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    async updateReadingLog(logId, logData) {
        try {
            const res = await fetch(`/api/reading-history/${logId}`, {
                method: 'PUT',
                headers: this._getHeaders(),
                credentials: 'include',
                body: JSON.stringify(logData)
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi sửa lịch sử đọc:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    async deleteReadingLog(logId) {
        try {
            const res = await fetch(`/api/reading-history/${logId}`, {
                method: 'DELETE',
                headers: this._getHeaders(),
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi xóa lịch sử đọc:', error);
            return { success: False, message: 'Lỗi kết nối máy chủ!' };
        }
    },

    // ==========================================
    // 5. CÁC API THỐNG KÊ
    // ==========================================
    async getDashboardStats() {
        try {
            const res = await fetch('/api/dashboard/stats', {
                method: 'GET',
                headers: this._getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            return data.success ? data.stats : null;
        } catch (error) {
            console.error('Lỗi khi tải thống kê dashboard:', error);
            return null;
        }
    },

    async getStatistics() {
        try {
            const res = await fetch('/api/statistics', {
                method: 'GET',
                headers: this._getHeaders(),
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('Lỗi khi tải thống kê phân tích:', error);
            return null;
        }
    }
};


window.StorageService = StorageService;
