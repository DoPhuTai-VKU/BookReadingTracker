/**
 * data.js - Dữ liệu mẫu (Mock Data) ban đầu cho hệ thống
 * Cung cấp tài khoản demo và dữ liệu sách, lịch sử đọc mẫu 
 * để người dùng có thể trải nghiệm ngay lập tức.
 */

const DEMO_USER_ID = 'user_demo_001';

const MOCK_DATA = {
    users: [
        {
            id: DEMO_USER_ID,
            fullName: 'Nguyễn Văn Đọc',
            email: 'demo@reading.com',
            password: 'password123', // Demo front-end
            createdAt: '2026-10-01T08:00:00.000Z'
        }
    ],
    books: [
        {
            id: 'book_001',
            userId: DEMO_USER_ID,
            title: 'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ',
            author: 'James Clear',
            category: 'Phát triển bản thân',
            totalPages: 320,
            createdAt: '2026-10-05T09:00:00.000Z'
        },
        {
            id: 'book_002',
            userId: DEMO_USER_ID,
            title: 'Nhà Giả Kim (The Alchemist)',
            author: 'Paulo Coelho',
            category: 'Văn học - Tiểu thuyết',
            totalPages: 228,
            createdAt: '2026-10-08T10:30:00.000Z'
        },
        {
            id: 'book_003',
            userId: DEMO_USER_ID,
            title: 'Tâm Lý Học Về Tiền (The Psychology of Money)',
            author: 'Morgan Housel',
            category: 'Kinh tế - Tài chính',
            totalPages: 384,
            createdAt: '2026-10-12T14:15:00.000Z'
        },
        {
            id: 'book_004',
            userId: DEMO_USER_ID,
            title: 'Clean Code - Nghệ Thuật Viết Code Sạch',
            author: 'Robert C. Martin',
            category: 'Công nghệ thông tin',
            totalPages: 464,
            createdAt: '2026-10-15T11:00:00.000Z'
        },
        {
            id: 'book_005',
            userId: DEMO_USER_ID,
            title: 'Cây Cam Ngọt Của Tôi',
            author: 'José Mauro de Vasconcelos',
            category: 'Văn học - Tiểu thuyết',
            totalPages: 244,
            createdAt: '2026-10-18T16:20:00.000Z'
        }
    ],
    readingHistory: [
        // Book 002: Nhà Giả Kim - Đã đọc đủ 228/228 -> Đã hoàn thành
        {
            id: 'log_001',
            userId: DEMO_USER_ID,
            bookId: 'book_002',
            readingDate: '2026-10-20',
            pagesRead: 60,
            note: 'Bắt đầu đọc về ước mơ của cậu bé chăn cừu Santiago.',
            createdAt: '2026-10-20T21:00:00.000Z'
        },
        {
            id: 'log_002',
            userId: DEMO_USER_ID,
            bookId: 'book_002',
            readingDate: '2026-10-22',
            pagesRead: 80,
            note: 'Cuộc gặp gỡ với vị vua xứ Salem và bài học về vận mệnh cá nhân.',
            createdAt: '2026-10-22T21:30:00.000Z'
        },
        {
            id: 'log_003',
            userId: DEMO_USER_ID,
            bookId: 'book_002',
            readingDate: '2026-10-25',
            pagesRead: 88,
            note: 'Kết thúc cuốn sách ở sa mạc và kim tự tháp. Rất xúc động!',
            createdAt: '2026-10-25T22:00:00.000Z'
        },

        // Book 001: Atomic Habits - Đọc 190/320 -> Đang đọc (59%)
        {
            id: 'log_004',
            userId: DEMO_USER_ID,
            bookId: 'book_001',
            readingDate: '2026-10-27',
            pagesRead: 45,
            note: 'Chương 1: Quy luật 1% mỗi ngày tạo nên thay đổi vĩ đại.',
            createdAt: '2026-10-27T20:15:00.000Z'
        },
        {
            id: 'log_005',
            userId: DEMO_USER_ID,
            bookId: 'book_001',
            readingDate: '2026-10-28',
            pagesRead: 55,
            note: 'Bốn quy luật để xây dựng thói quen tốt dễ dàng hơn.',
            createdAt: '2026-10-28T21:10:00.000Z'
        },
        {
            id: 'log_006',
            userId: DEMO_USER_ID,
            bookId: 'book_001',
            readingDate: '2026-10-29',
            pagesRead: 50,
            note: 'Thiết kế môi trường xung quanh để kích hoạt thói quen.',
            createdAt: '2026-10-29T21:40:00.000Z'
        },
        {
            id: 'log_007',
            userId: DEMO_USER_ID,
            bookId: 'book_001',
            readingDate: '2026-10-31',
            pagesRead: 40,
            note: 'Quy tắc 2 phút để đánh bại thói quen trì hoãn.',
            createdAt: '2026-10-31T20:00:00.000Z'
        },

        // Book 003: Tâm Lý Học Về Tiền - Đọc 120/384 -> Đang đọc (31%)
        {
            id: 'log_008',
            userId: DEMO_USER_ID,
            bookId: 'book_003',
            readingDate: '2026-11-01',
            pagesRead: 60,
            note: 'Không ai điên rồ cả: góc nhìn thú vị về cách mỗi người quản lý tiền bạc.',
            createdAt: '2026-11-01T19:30:00.000Z'
        },
        {
            id: 'log_009',
            userId: DEMO_USER_ID,
            bookId: 'book_003',
            readingDate: '2026-11-02',
            pagesRead: 60,
            note: 'Sức mạnh của lãi kép và sự kiên nhẫn qua thời gian dài.',
            createdAt: '2026-11-02T22:15:00.000Z'
        },

        // Book 004: Clean Code - Đọc 75/464 -> Đang đọc (16%)
        {
            id: 'log_010',
            userId: DEMO_USER_ID,
            bookId: 'book_004',
            readingDate: '2026-11-03',
            pagesRead: 75,
            note: 'Cách đặt tên biến, hàm có ý nghĩa và quy tắc hàm ngắn gọn.',
            createdAt: '2026-11-03T15:00:00.000Z'
        }
    ]
};

/**
 * Khởi tạo dữ liệu mẫu nếu localStorage chưa có
 */
function initMockData() {
    const existingUsers = localStorage.getItem('brt_users');
    if (!existingUsers || JSON.parse(existingUsers).length === 0) {
        console.log('Seeding initial mock data for demo...');
        localStorage.setItem('brt_users', JSON.stringify(MOCK_DATA.users));
        localStorage.setItem('brt_books', JSON.stringify(MOCK_DATA.books));
        localStorage.setItem('brt_reading_history', JSON.stringify(MOCK_DATA.readingHistory));
    }
}

// Tự động kiểm tra và seed khi tải trang
initMockData();
