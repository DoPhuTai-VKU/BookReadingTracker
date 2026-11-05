/**
 * dashboard.js - Xử lý hiển thị số liệu tổng quan & biểu đồ Dashboard
 */

let readingChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

/**
 * Tải và hiển thị toàn bộ số liệu trên Dashboard
 */
function loadDashboardData() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    // Cập nhật tên chào mừng
    const welcomeName = document.getElementById('welcomeUserName');
    if (welcomeName) {
        welcomeName.textContent = currentUser.fullName;
    }

    // Lấy thống kê tổng quan
    const stats = StorageService.getUserStatistics(currentUser.id);

    // Cập nhật các thẻ số liệu
    animateNumber('statTotalBooks', stats.totalBooks);
    animateNumber('statCompletedBooks', stats.completedBooks);
    animateNumber('statTotalPages', stats.totalPagesRead);
    animateNumber('statReadingDays', stats.uniqueReadingDays);

    // Render danh sách sách đang đọc gần đây
    renderCurrentlyReadingBooks(currentUser.id);

    // Render bảng hoạt động đọc gần nhất
    renderRecentLogs(currentUser.id);

    // Render biểu đồ số trang theo ngày
    renderReadingTrendChart(currentUser.id);
}

/**
 * Hiệu ứng nhảy số đẹp mắt
 */
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const steps = Math.ceil(duration / stepTime);
    const increment = targetNumber / steps;

    if (targetNumber === 0) {
        element.textContent = '0';
        return;
    }

    const timer = setInterval(() => {
        start += increment;
        if (start >= targetNumber) {
            element.textContent = targetNumber.toLocaleString('vi-VN');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString('vi-VN');
        }
    }, stepTime);
}

/**
 * Render danh sách sách đang đọc
 */
function renderCurrentlyReadingBooks(userId) {
    const container = document.getElementById('currentlyReadingList');
    if (!container) return;

    const books = StorageService.getUserBooksWithProgress(userId);
    const readingBooks = books.filter(b => b.status === 'Đang đọc').slice(0, 4);

    if (readingBooks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem 1rem;">
                <div class="empty-state-icon" style="width: 50px; height: 50px; font-size: 1.3rem;">
                    <i class="fas fa-book"></i>
                </div>
                <div class="empty-state-title" style="font-size: 0.95rem;">Chưa có sách đang đọc</div>
                <div class="empty-state-desc" style="font-size: 0.8rem; margin-bottom: 0.75rem;">
                    Hãy thêm cuốn sách bạn yêu thích để bắt đầu theo dõi.
                </div>
                <a href="books.html" class="btn btn-sm btn-primary">
                    <i class="fas fa-plus"></i> Thêm sách
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = readingBooks.map(book => `
        <div class="book-mini-item">
            <div class="book-mini-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-mini-details">
                <div class="book-mini-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
                <div class="book-mini-author">${escapeHtml(book.author)}</div>
                <div class="progress-container">
                    <div class="progress-info" style="font-size: 0.75rem; margin-bottom: 0.2rem;">
                        <span>${book.readPages}/${book.totalPages} trang</span>
                        <span>${book.percent}%</span>
                    </div>
                    <div class="progress-bar-bg" style="height: 6px;">
                        <div class="progress-bar-fill" style="width: ${book.percent}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Render các lần đọc sách gần đây nhất
 */
function renderRecentLogs(userId) {
    const tbody = document.getElementById('recentLogsTableBody');
    if (!tbody) return;

    const logs = StorageService.getReadingLogsByUserId(userId).slice(0, 5);

    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fas fa-calendar-xmark" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block;"></i>
                    Chưa có lịch sử đọc sách nào được ghi nhận.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const book = StorageService.getBookById(log.bookId);
        const bookTitle = book ? book.title : 'Sách đã xóa';
        const formattedDate = formatDate(log.readingDate);

        return `
            <tr>
                <td><strong>${escapeHtml(bookTitle)}</strong></td>
                <td><i class="far fa-calendar-alt" style="color: var(--text-muted); margin-right: 4px;"></i> ${formattedDate}</td>
                <td><span class="badge badge-category">+${log.pagesRead} trang</span></td>
                <td style="color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${escapeHtml(log.note || 'Không có ghi chú')}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Vẽ biểu đồ số trang đọc theo ngày bằng Chart.js
 */
function renderReadingTrendChart(userId) {
    const canvas = document.getElementById('readingTrendChart');
    if (!canvas) return;

    const logs = StorageService.getReadingLogsByUserId(userId);

    // Nhóm số trang theo ngày
    const pagesByDate = {};
    logs.forEach(log => {
        const date = log.readingDate;
        pagesByDate[date] = (pagesByDate[date] || 0) + (parseInt(log.pagesRead, 10) || 0);
    });

    // Lấy 7 ngày gần nhất (sắp xếp tăng dần theo thời gian)
    let sortedDates = Object.keys(pagesByDate).sort();
    if (sortedDates.length > 7) {
        sortedDates = sortedDates.slice(-7);
    }

    // Nếu chưa có dữ liệu nào, tạo danh sách 7 ngày trống gần đây
    if (sortedDates.length === 0) {
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            sortedDates.push(dateStr);
            pagesByDate[dateStr] = 0;
        }
    }

    const labels = sortedDates.map(dateStr => {
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}`; // dd/mm
    });

    const dataPoints = sortedDates.map(d => pagesByDate[d] || 0);

    if (readingChartInstance) {
        readingChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    readingChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số trang đã đọc',
                data: dataPoints,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: '#4f46e5',
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 36
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { family: 'Plus Jakarta Sans', size: 13 },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `Đã đọc: ${context.parsed.y} trang`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10,
                        color: '#64748b',
                        font: { family: 'Plus Jakarta Sans' }
                    },
                    grid: {
                        color: '#f1f5f9'
                    }
                },
                x: {
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Plus Jakarta Sans' }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Format ngày YYYY-MM-DD sang DD/MM/YYYY
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

/**
 * Escape chuỗi HTML tránh XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
