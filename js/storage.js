/**
 * storage.js - Quản lý lưu trữ dữ liệu bằng localStorage
 * Được thiết kế theo mô hình Repository/Service Pattern để sau này 
 * có thể dễ dàng thay thế bằng API Python Flask (RESTful API).
 */

const STORAGE_KEYS = {
    USERS: 'brt_users',
    BOOKS: 'brt_books',
    READING_HISTORY: 'brt_reading_history',
    CURRENT_USER: 'brt_current_user'
};

const StorageService = {
    // ==========================================
    // HELPER METHODS
    // ==========================================
    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return [];
        }
    },

    _set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            return false;
        }
    },

    generateId() {
        return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    },

    // ==========================================
    // AUTH & SESSION METHODS
    // ==========================================
    getCurrentUser() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            return;
        }
        // Lưu thông tin an toàn (không kèm password trong session)
        const safeUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            createdAt: user.createdAt
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    },

    clearSession() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    // ==========================================
    // USER REPOSITORY
    // ==========================================
    getUsers() {
        return this._get(STORAGE_KEYS.USERS);
    },

    findUserByEmail(email) {
        if (!email) return null;
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
    },

    findUserById(userId) {
        if (!userId) return null;
        const users = this.getUsers();
        return users.find(u => u.id === userId) || null;
    },

    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: this.generateId(),
            fullName: userData.fullName.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password,
            createdAt: userData.createdAt || new Date().toISOString()
        };
        users.push(newUser);
        this._set(STORAGE_KEYS.USERS, users);
        return newUser;
    },

    updateUser(userId, updatedFields) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updatedFields };
        this._set(STORAGE_KEYS.USERS, users);

        // Nếu đang sửa user đang đăng nhập, cập nhật lại session
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setCurrentUser(users[index]);
        }

        return users[index];
    },

    // ==========================================
    // BOOK REPOSITORY
    // ==========================================
    getAllBooks() {
        return this._get(STORAGE_KEYS.BOOKS);
    },

    getBooksByUserId(userId) {
        if (!userId) return [];
        const books = this.getAllBooks();
        return books.filter(b => b.userId === userId);
    },

    getBookById(bookId) {
        if (!bookId) return null;
        const books = this.getAllBooks();
        return books.find(b => b.id === bookId) || null;
    },

    createBook(bookData) {
        const books = this.getAllBooks();
        const newBook = {
            id: this.generateId(),
            userId: bookData.userId,
            title: bookData.title.trim(),
            author: bookData.author.trim(),
            category: bookData.category.trim(),
            totalPages: parseInt(bookData.totalPages, 10),
            createdAt: new Date().toISOString()
        };
        books.push(newBook);
        this._set(STORAGE_KEYS.BOOKS, books);
        return newBook;
    },

    updateBook(bookId, updatedFields) {
        const books = this.getAllBooks();
        const index = books.findIndex(b => b.id === bookId);
        if (index === -1) return null;

        if (updatedFields.totalPages) {
            updatedFields.totalPages = parseInt(updatedFields.totalPages, 10);
        }
        if (updatedFields.title) updatedFields.title = updatedFields.title.trim();
        if (updatedFields.author) updatedFields.author = updatedFields.author.trim();
        if (updatedFields.category) updatedFields.category = updatedFields.category.trim();

        books[index] = { ...books[index], ...updatedFields };
        this._set(STORAGE_KEYS.BOOKS, books);
        return books[index];
    },

    deleteBook(bookId) {
        let books = this.getAllBooks();
        books = books.filter(b => b.id !== bookId);
        this._set(STORAGE_KEYS.BOOKS, books);

        // Đồng thời xóa các bản ghi lịch sử đọc của cuốn sách này
        let history = this.getAllReadingHistory();
        history = history.filter(h => h.bookId !== bookId);
        this._set(STORAGE_KEYS.READING_HISTORY, history);

        return true;
    },

    // ==========================================
    // READING HISTORY REPOSITORY
    // ==========================================
    getAllReadingHistory() {
        return this._get(STORAGE_KEYS.READING_HISTORY);
    },

    getReadingLogsByUserId(userId) {
        if (!userId) return [];
        const history = this.getAllReadingHistory();
        return history
            .filter(h => h.userId === userId)
            .sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
    },

    getReadingLogsByBookId(bookId) {
        if (!bookId) return [];
        const history = this.getAllReadingHistory();
        return history.filter(h => h.bookId === bookId);
    },

    getReadingLogById(logId) {
        if (!logId) return null;
        const history = this.getAllReadingHistory();
        return history.find(h => h.id === logId) || null;
    },

    createReadingLog(logData) {
        const history = this.getAllReadingHistory();
        const newLog = {
            id: this.generateId(),
            userId: logData.userId,
            bookId: logData.bookId,
            readingDate: logData.readingDate,
            pagesRead: parseInt(logData.pagesRead, 10),
            note: (logData.note || '').trim(),
            createdAt: new Date().toISOString()
        };
        history.push(newLog);
        this._set(STORAGE_KEYS.READING_HISTORY, history);
        return newLog;
    },

    updateReadingLog(logId, updatedFields) {
        const history = this.getAllReadingHistory();
        const index = history.findIndex(h => h.id === logId);
        if (index === -1) return null;

        if (updatedFields.pagesRead) {
            updatedFields.pagesRead = parseInt(updatedFields.pagesRead, 10);
        }
        if (updatedFields.note !== undefined) {
            updatedFields.note = updatedFields.note.trim();
        }

        history[index] = { ...history[index], ...updatedFields };
        this._set(STORAGE_KEYS.READING_HISTORY, history);
        return history[index];
    },

    deleteReadingLog(logId) {
        let history = this.getAllReadingHistory();
        history = history.filter(h => h.id !== logId);
        this._set(STORAGE_KEYS.READING_HISTORY, history);
        return true;
    },

    // ==========================================
    // BUSINESS LOGIC HELPERS
    // ==========================================
    /**
     * Tính toán tổng số trang đã đọc, tiến độ % và trạng thái của cuốn sách
     * Quy tắc nghiệp vụ:
     * - Tiến độ = (Tổng trang đã đọc / Tổng số trang) * 100%
     * - Khi tiến độ đạt 100% -> 'Đã hoàn thành'
     * - Khi < 100% -> 'Đang đọc'
     */
    getBookProgress(bookId) {
        const book = this.getBookById(bookId);
        if (!book) return { readPages: 0, totalPages: 0, percent: 0, status: 'Đang đọc' };

        const logs = this.getReadingLogsByBookId(bookId);
        const readPages = logs.reduce((sum, item) => sum + (parseInt(item.pagesRead, 10) || 0), 0);
        const totalPages = parseInt(book.totalPages, 10) || 1;
        
        const cappedReadPages = Math.min(readPages, totalPages);
        const percent = Math.min(100, Math.round((cappedReadPages / totalPages) * 100));
        const status = (cappedReadPages >= totalPages && totalPages > 0) ? 'Đã hoàn thành' : 'Đang đọc';

        return {
            readPages: cappedReadPages,
            rawReadPages: readPages,
            totalPages: totalPages,
            percent: percent,
            status: status
        };
    },

    /**
     * Lấy danh sách sách của user kèm thông tin tiến độ đã tính toán
     */
    getUserBooksWithProgress(userId) {
        const books = this.getBooksByUserId(userId);
        return books.map(book => {
            const progress = this.getBookProgress(book.id);
            return {
                ...book,
                readPages: progress.readPages,
                percent: progress.percent,
                status: progress.status
            };
        });
    },

    /**
     * Tính toán thống kê tổng thể cho một user (cho Dashboard & Statistics)
     */
    getUserStatistics(userId) {
        const booksWithProgress = this.getUserBooksWithProgress(userId);
        const logs = this.getReadingLogsByUserId(userId);

        const totalBooks = booksWithProgress.length;
        const completedBooks = booksWithProgress.filter(b => b.status === 'Đã hoàn thành').length;
        const readingBooks = totalBooks - completedBooks;

        // Tổng số trang đã đọc từ tất cả các lần đọc
        const totalPagesRead = logs.reduce((sum, log) => sum + (parseInt(log.pagesRead, 10) || 0), 0);

        // Số ngày độc nhất có hoạt động đọc sách
        const uniqueReadingDays = new Set(logs.map(log => log.readingDate)).size;

        // Số trang đọc trung bình mỗi ngày đọc
        const avgPagesPerDay = uniqueReadingDays > 0 ? Math.round(totalPagesRead / uniqueReadingDays) : 0;

        return {
            totalBooks,
            completedBooks,
            readingBooks,
            totalPagesRead,
            uniqueReadingDays,
            avgPagesPerDay
        };
    }
};

// Export to global scope
window.StorageService = StorageService;
