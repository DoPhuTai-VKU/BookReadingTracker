let allUserLogs = [];
let userBooksList = [];
let deleteLogTargetId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadReadingHistoryPage();
    initHistoryEventListeners();
    checkUrlQueryParams();
});

/**
 * Tải dữ liệu ban đầu cho trang Lịch sử đọc từ API
 */
async function loadReadingHistoryPage() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    // Lấy sách và lịch sử đọc từ API
    userBooksList = await StorageService.getBooks();
    allUserLogs = await StorageService.getReadingHistory();

    // Điền danh sách sách vào dropdown bộ lọc và dropdown thêm mới
    populateBookDropdowns(userBooksList);

    // Đặt ngày hôm nay làm giá trị mặc định cho form
    const today = new Date().toISOString().split('T')[0];
    const addDateInput = document.getElementById('addLogDate');
    if (addDateInput) addDateInput.value = today;

    // Render danh sách
    filterAndRenderHistory();
}

/**
 * Nạp dropdown sách cho bộ lọc và modal
 */
function populateBookDropdowns(books) {
    const filterSelect = document.getElementById('bookFilterSelect');
    const addSelect = document.getElementById('addLogBookId');

    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">Tất cả các cuốn sách</option>';
        books.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.title;
            if (b.id == currentVal) opt.selected = true;
            filterSelect.appendChild(opt);
        });
    }

    if (addSelect) {
        addSelect.innerHTML = '<option value="">-- Chọn cuốn sách bạn đang đọc --</option>';
        books.forEach(b => {
            const remaining = Math.max(0, b.totalPages - b.readPages);
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.title} (Còn ${remaining}/${b.totalPages} trang)`;
            opt.dataset.remaining = remaining;
            opt.dataset.totalPages = b.totalPages;
            addSelect.appendChild(opt);
        });
    }
}

/**
 * Lọc và render bảng lịch sử đọc
 */
function filterAndRenderHistory() {
    const selectedBookId = document.getElementById('bookFilterSelect')?.value || 'all';
    const selectedDate = document.getElementById('dateFilterInput')?.value || '';

    let filtered = allUserLogs.filter(log => {
        const matchBook = selectedBookId === 'all' || log.bookId == selectedBookId;
        const matchDate = !selectedDate || log.readingDate === selectedDate;
        return matchBook && matchDate;
    });

    renderHistoryTable(filtered);
}

/**
 * Render bảng danh sách lịch sử đọc
 */
function renderHistoryTable(logs) {
    const tbody = document.getElementById('readingHistoryTableBody');
    const countBadge = document.getElementById('historyCountBadge');
    if (!tbody) return;

    if (countBadge) {
        countBadge.textContent = `${logs.length} bản ghi`;
    }

    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state" style="padding: 3rem 1rem;">
                        <div class="empty-state-icon">
                            <i class="fas fa-clock-rotate-left"></i>
                        </div>
                        <h3 class="empty-state-title">Chưa có bản ghi lịch sử đọc nào</h3>
                        <p class="empty-state-desc">
                            Ghi lại những trang sách bạn đã đọc mỗi ngày để theo dõi sự tiến bộ!
                        </p>
                        <button type="button" class="btn btn-primary" onclick="openAddLogModal()">
                            <i class="fas fa-plus"></i> Ghi nhận lượt đọc đầu tiên
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const bookTitle = log.bookTitle || 'Sách';
        const formattedDate = formatDate(log.readingDate);

        return `
            <tr>
                <td><strong>${escapeHtml(bookTitle)}</strong></td>
                <td><i class="far fa-calendar-alt" style="color: var(--text-muted); margin-right: 6px;"></i> ${formattedDate}</td>
                <td><span class="badge badge-category" style="font-size: 0.85rem;">+${log.pagesRead} trang</span></td>
                <td class="note-cell">${escapeHtml(log.note || '—')}</td>
                <td>
                    <div style="display: flex; gap: 0.35rem;">
                        <button type="button" class="btn-icon" title="Chỉnh sửa bản ghi" onclick="openEditLogModal(${log.id})">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-icon delete" title="Xóa bản ghi" onclick="confirmDeleteLog(${log.id})">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Gán sự kiện cho bộ lọc và form
 */
function initHistoryEventListeners() {
    const bookFilter = document.getElementById('bookFilterSelect');
    const dateFilter = document.getElementById('dateFilterInput');
    const btnResetFilter = document.getElementById('btnResetFilter');

    if (bookFilter) bookFilter.addEventListener('change', filterAndRenderHistory);
    if (dateFilter) dateFilter.addEventListener('change', filterAndRenderHistory);

    if (btnResetFilter) {
        btnResetFilter.addEventListener('click', () => {
            if (bookFilter) bookFilter.value = 'all';
            if (dateFilter) dateFilter.value = '';
            filterAndRenderHistory();
        });
    }

    // Modal Add Form Change: Khi chọn sách -> hiển thị gợi ý số trang còn lại
    const addSelect = document.getElementById('addLogBookId');
    const addHint = document.getElementById('addRemainingHint');
    if (addSelect && addHint) {
        addSelect.addEventListener('change', () => {
            const selectedOpt = addSelect.selectedOptions[0];
            if (selectedOpt && selectedOpt.value) {
                const remaining = parseInt(selectedOpt.dataset.remaining, 10);
                const total = selectedOpt.dataset.totalPages;
                if (remaining <= 0) {
                    addHint.textContent = `Cuốn sách này đã hoàn thành 100% (${total}/${total} trang).`;
                    addHint.style.color = 'var(--success)';
                } else {
                    addHint.textContent = `Cuốn sách này còn lại ${remaining} trang chưa đọc.`;
                    addHint.style.color = 'var(--primary)';
                }
            } else {
                addHint.textContent = '';
            }
        });
    }

    // Submit Thêm Lịch sử
    const addForm = document.getElementById('addLogForm');
    if (addForm) addForm.addEventListener('submit', handleAddLogSubmit);

    // Submit Sửa Lịch sử
    const editForm = document.getElementById('editLogForm');
    if (editForm) editForm.addEventListener('submit', handleEditLogSubmit);

    // Nút xác nhận xóa trong modal
    const btnConfirmDelete = document.getElementById('btnConfirmDeleteLog');
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', executeDeleteLog);
}

/**
 * Mở modal Thêm Lịch sử
 */
function openAddLogModal(preselectedBookId = null) {
    if (userBooksList.length === 0) {
        showToast('Bạn chưa có cuốn sách nào trong tủ sách. Vui lòng thêm sách trước!', 'warning');
        setTimeout(() => {
            window.location.href = 'books.html';
        }, 1500);
        return;
    }

    const form = document.getElementById('addLogForm');
    if (form) form.reset();

    const today = new Date().toISOString().split('T')[0];
    const addDateInput = document.getElementById('addLogDate');
    if (addDateInput) addDateInput.value = today;

    // Refresh lại dropdown sách
    populateBookDropdowns(userBooksList);

    if (preselectedBookId) {
        const addSelect = document.getElementById('addLogBookId');
        if (addSelect) {
            addSelect.value = preselectedBookId;
            addSelect.dispatchEvent(new Event('change'));
        }
    }

    openModal('addLogModal');
}

/**
 * Xử lý thêm mới bản ghi đọc sách
 */
async function handleAddLogSubmit(e) {
    e.preventDefault();
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const bookId = document.getElementById('addLogBookId').value;
    const readingDate = document.getElementById('addLogDate').value;
    const pagesReadInput = document.getElementById('addLogPages');
    const note = document.getElementById('addLogNote').value.trim();

    const pagesRead = parseInt(pagesReadInput.value, 10);

    if (!bookId) {
        showToast('Vui lòng chọn cuốn sách đã đọc!', 'error');
        return;
    }
    if (!readingDate) {
        showToast('Vui lòng chọn ngày đọc!', 'error');
        return;
    }
    if (isNaN(pagesRead) || pagesRead <= 0) {
        showToast('Số trang đọc phải là số nguyên dương lớn hơn 0!', 'error');
        pagesReadInput.focus();
        return;
    }

    // Gọi API thêm bản ghi
    const result = await StorageService.createReadingLog({
        bookId,
        readingDate,
        pagesRead,
        note
    });

    if (result && result.success) {
        closeModal('addLogModal');
        showToast(result.message || 'Đã ghi nhận lần đọc sách thành công!', 'success');
        loadReadingHistoryPage();
    } else {
        showToast((result && result.message) || 'Lỗi khi ghi nhận đọc sách!', 'error');
    }
}

/**
 * Mở modal Chỉnh sửa bản ghi
 */
function openEditLogModal(logId) {
    const log = allUserLogs.find(l => l.id == logId);
    if (!log) return;

    const book = userBooksList.find(b => b.id == log.bookId);

    document.getElementById('editLogId').value = log.id;
    document.getElementById('editLogBookId').value = log.bookId;
    document.getElementById('editLogBookTitle').textContent = log.bookTitle || 'Sách';
    document.getElementById('editLogDate').value = log.readingDate;
    document.getElementById('editLogPages').value = log.pagesRead;
    document.getElementById('editLogNote').value = log.note || '';

    const hintEl = document.getElementById('editRemainingHint');
    if (hintEl && book) {
        hintEl.textContent = `Cuốn sách này có tổng cộng ${book.totalPages} trang.`;
    }

    openModal('editLogModal');
}

/**
 * Xử lý submit sửa bản ghi
 */
async function handleEditLogSubmit(e) {
    e.preventDefault();

    const logId = document.getElementById('editLogId').value;
    const readingDate = document.getElementById('editLogDate').value;
    const pagesReadInput = document.getElementById('editLogPages');
    const note = document.getElementById('editLogNote').value.trim();

    const newPagesRead = parseInt(pagesReadInput.value, 10);

    if (isNaN(newPagesRead) || newPagesRead <= 0) {
        showToast('Số trang đọc phải là số nguyên dương lớn hơn 0!', 'error');
        pagesReadInput.focus();
        return;
    }

    const result = await StorageService.updateReadingLog(logId, {
        readingDate,
        pagesRead: newPagesRead,
        note
    });

    if (result && result.success) {
        closeModal('editLogModal');
        showToast(result.message || 'Đã cập nhật bản ghi lịch sử đọc!', 'success');
        loadReadingHistoryPage();
    } else {
        showToast((result && result.message) || 'Lỗi khi sửa bản ghi!', 'error');
    }
}

/**
 * Xử lý Xóa bản ghi
 */
function confirmDeleteLog(logId) {
    const log = allUserLogs.find(l => l.id == logId);
    if (!log) return;

    deleteLogTargetId = logId;
    const msgEl = document.getElementById('deleteLogMessage');
    if (msgEl) {
        msgEl.innerHTML = `Bạn có chắc chắn muốn xóa bản ghi đọc <strong>${log.pagesRead} trang</strong> của cuốn sách <strong>"${escapeHtml(log.bookTitle || 'Sách')}"</strong> ngày ${formatDate(log.readingDate)}?`;
    }

    openModal('deleteLogModal');
}

async function executeDeleteLog() {
    if (!deleteLogTargetId) return;

    const result = await StorageService.deleteReadingLog(deleteLogTargetId);
    closeModal('deleteLogModal');
    deleteLogTargetId = null;

    if (result && result.success) {
        showToast(result.message || 'Đã xóa bản ghi lịch sử đọc thành công!', 'success');
        loadReadingHistoryPage();
    } else {
        showToast((result && result.message) || 'Lỗi khi xóa bản ghi!', 'error');
    }
}

/**
 * Kiểm tra query param ?bookId=... từ URL
 */
function checkUrlQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');

    if (bookId) {
        setTimeout(() => {
            openAddLogModal(bookId);
        }, 300);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
