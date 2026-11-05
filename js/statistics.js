/**
 * statistics.js - Xử lý tính toán thống kê chuyên sâu & vẽ biểu đồ Chart.js
 */

let chartPagesInstance = null;
let chartCategoryInstance = null;
let chartProgressInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadStatisticsPage();
});

/**
 * Tải toàn bộ dữ liệu phân tích và vẽ biểu đồ
 */
function loadStatisticsPage() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const stats = StorageService.getUserStatistics(currentUser.id);
    const books = StorageService.getUserBooksWithProgress(currentUser.id);
    const logs = StorageService.getReadingLogsByUserId(currentUser.id);

    // Điền các thẻ tóm tắt
    document.getElementById('statTotalPages').textContent = stats.totalPagesRead.toLocaleString('vi-VN');
    document.getElementById('statAvgPages').textContent = stats.avgPagesPerDay.toLocaleString('vi-VN');
    document.getElementById('statReadingDays').textContent = stats.uniqueReadingDays;

    const completionRate = stats.totalBooks > 0 ? Math.round((stats.completedBooks / stats.totalBooks) * 100) : 0;
    document.getElementById('statCompletionRate').textContent = `${completionRate}%`;

    // Vẽ 3 biểu đồ
    renderPagesByDayChart(logs);
    renderCategoryChart(books);
    renderBookProgressChart(books);
}

/**
 * 1. BIỂU ĐỒ CỘT: SỐ TRANG ĐÃ ĐỌC THEO NGÀY
 */
function renderPagesByDayChart(logs) {
    const canvas = document.getElementById('chartPagesByDay');
    if (!canvas) return;

    if (chartPagesInstance) chartPagesInstance.destroy();

    // Nhóm theo ngày
    const pagesByDate = {};
    logs.forEach(log => {
        pagesByDate[log.readingDate] = (pagesByDate[log.readingDate] || 0) + (parseInt(log.pagesRead, 10) || 0);
    });

    const sortedDates = Object.keys(pagesByDate).sort();

    if (sortedDates.length === 0) {
        showChartEmptyState('chartPagesByDayContainer', 'Chưa có dữ liệu ngày đọc');
        return;
    }

    const labels = sortedDates.map(d => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`;
    });
    const values = sortedDates.map(d => pagesByDate[d]);

    const ctx = canvas.getContext('2d');
    chartPagesInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số trang đã đọc',
                data: values,
                backgroundColor: 'rgba(79, 70, 229, 0.85)',
                borderColor: '#4338ca',
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => `Ngày ${items[0].label}`,
                        label: (ctx) => `Số trang: ${ctx.parsed.y} trang`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 10, color: '#64748b' },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { color: '#64748b' },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * 2. BIỂU ĐỒ TRÒN: PHÂN BỐ THỂ LOẠI SÁCH
 */
function renderCategoryChart(books) {
    const canvas = document.getElementById('chartBooksByCategory');
    if (!canvas) return;

    if (chartCategoryInstance) chartCategoryInstance.destroy();

    if (books.length === 0) {
        showChartEmptyState('chartCategoryContainer', 'Chưa có sách trong tủ');
        return;
    }

    // Đếm số lượng sách theo thể loại
    const categoryCount = {};
    books.forEach(b => {
        const cat = b.category || 'Khác';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const labels = Object.keys(categoryCount);
    const data = Object.values(categoryCount);

    const modernPalette = [
        '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', 
        '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#64748b'
    ];

    const ctx = canvas.getContext('2d');
    chartCategoryInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: modernPalette.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: { family: 'Plus Jakarta Sans', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.raw} cuốn (${Math.round((ctx.raw / books.length) * 100)}%)`
                    }
                }
            },
            cutout: '65%'
        }
    });
}

/**
 * 3. BIỂU ĐỒ THANH NGANG: TIẾN ĐỘ TỪNG CUỐN SÁCH
 */
function renderBookProgressChart(books) {
    const canvas = document.getElementById('chartBookProgress');
    if (!canvas) return;

    if (chartProgressInstance) chartProgressInstance.destroy();

    if (books.length === 0) {
        showChartEmptyState('chartProgressContainer', 'Chưa có sách để hiển thị tiến độ');
        return;
    }

    // Cắt ngắn tên sách nếu quá dài
    const labels = books.map(b => b.title.length > 25 ? b.title.substring(0, 25) + '...' : b.title);
    const percentages = books.map(b => b.percent);

    const backgroundColors = books.map(b => b.percent === 100 ? '#10b981' : '#4f46e5');

    const ctx = canvas.getContext('2d');
    chartProgressInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                axis: 'y',
                label: 'Tiến độ hoàn thành (%)',
                data: percentages,
                backgroundColor: backgroundColors,
                borderRadius: 6,
                maxBarThickness: 24
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const book = books[ctx.dataIndex];
                            return `Đã đọc: ${book.readPages}/${book.totalPages} trang (${ctx.raw}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (val) => val + '%',
                        color: '#64748b'
                    },
                    grid: { color: '#f1f5f9' }
                },
                y: {
                    ticks: { color: '#0f172a', font: { weight: 600 } },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Hiển thị thông báo khi biểu đồ trống
 */
function showChartEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.9rem;">
            <i class="fas fa-chart-pie" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.4;"></i>
            <span>${message}</span>
        </div>
    `;
}
