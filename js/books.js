let allUserBooks = [];
let deleteBookTargetId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserBooks();
    initBookEventListeners();
});

/**
 * Tải danh sách sách từ API và render
 */
async function loadUserBooks() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    allUserBooks = await StorageService.getBooks();
    populateCategoryFilter(allUserBooks);
    filterAndRenderBooks();
}

/**
 * Lọc và render danh sách sách ra giao diện
 */
function filterAndRenderBooks() {
    const searchKeyword = (document.getElementById('searchBookInput')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

    let filtered = allUserBooks.filter(book => {
        // Tìm kiếm theo tên sách hoặc tác giả
        const matchKeyword = !searchKeyword ||
            book.title.toLowerCase().includes(searchKeyword) ||
            book.author.toLowerCase().includes(searchKeyword);

        // Lọc theo trạng thái
        const matchStatus = statusFilter === 'all' || book.status === statusFilter;

        // Lọc theo thể loại
        const matchCategory = categoryFilter === 'all' || book.category === categoryFilter;

        return matchKeyword && matchStatus && matchCategory;
    });

    renderBooksGrid(filtered);
}

/**
 * Tự động tạo danh sách thể loại cho dropdown bộ lọc
 */
function populateCategoryFilter(books) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const currentVal = select.value;
    const categories = Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort();

    select.innerHTML = '<option value="all">Tất cả thể loại</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === currentVal) option.selected = true;
        select.appendChild(option);
    });
}

/**
 * Render mảng sách thành các thẻ card
 */
function renderBooksGrid(books) {
    const container = document.getElementById('booksGridContainer');
    const countBadge = document.getElementById('booksCountBadge');
    if (!container) return;

    if (countBadge) {
        countBadge.textContent = `${books.length} cuốn`;
    }

    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3 class="empty-state-title">Không tìm thấy cuốn sách nào</h3>
                <p class="empty-state-desc">
                    Bạn chưa có cuốn sách nào hoặc không có cuốn sách nào khớp với bộ lọc hiện tại.
                </p>
                <button type="button" class="btn btn-primary" onclick="openAddBookModal()">
                    <i class="fas fa-plus"></i> Thêm cuốn sách đầu tiên
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = books.map(book => {
        const isCompleted = book.status === 'Đã hoàn thành';
        const badgeClass = isCompleted ? 'badge-completed' : 'badge-reading';
        const badgeIcon = isCompleted ? 'fa-circle-check' : 'fa-spinner';
        const fillClass = isCompleted ? 'completed' : '';

        return `
            <div class="book-card" data-id="${book.id}">
                <div class="book-card-header">
                    <div class="book-cover-mock">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="book-card-title-wrap">
                        <h3 class="book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3>
                        <div class="book-author">
                            <i class="fas fa-pen-nib"></i> ${escapeHtml(book.author)}
                        </div>
                    </div>
                </div>

                <div class="book-card-body">
                    <div class="book-meta-chips">
                        <span class="badge ${badgeClass}">
                            <i class="fas ${badgeIcon}"></i> ${book.status}
                        </span>
                        <span class="badge badge-category">
                            <i class="fas fa-tag"></i> ${escapeHtml(book.category)}
                        </span>
                    </div>

                    <div class="book-progress-box">
                        <div class="progress-info">
                            <span>Tiến độ: <strong>${book.readPages}</strong>/${book.totalPages} trang</span>
                            <span><strong>${book.percent}%</strong></span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill ${fillClass}" style="width: ${book.percent}%"></div>
                        </div>
                    </div>
                </div>

                <div class="book-card-footer">
                    <a href="reading-history.html?bookId=${book.id}" class="btn btn-sm btn-primary" title="Ghi nhận nhật ký đọc sách">
                        <i class="fas fa-plus"></i> Đọc sách
                    </a>
                    <div class="book-actions">
                        <button type="button" class="btn-icon" title="Chỉnh sửa sách" onclick="openEditBookModal(${book.id})">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-icon delete" title="Xóa sách" onclick="confirmDeleteBook(${book.id})">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Gán sự kiện tìm kiếm & lọc
 */
function initBookEventListeners() {
    const searchInput = document.getElementById('searchBookInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', () => filterAndRenderBooks());
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', () => filterAndRenderBooks());
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => filterAndRenderBooks());
    }

    // Form thêm sách
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBookSubmit);
    }

    // Form sửa sách
    const editBookForm = document.getElementById('editBookForm');
    if (editBookForm) {
        editBookForm.addEventListener('submit', handleEditBookSubmit);
    }

    // Nút xác nhận xóa trong modal
    const btnConfirmDelete = document.getElementById('btnConfirmDeleteBook');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', executeDeleteBook);
    }
}

/**
 * Xử lý thêm sách mới
 */
function openAddBookModal() {
    const form = document.getElementById('addBookForm');
    if (form) form.reset();
    openModal('addBookModal');
    setTimeout(() => document.getElementById('addBookTitle')?.focus(), 100);
}

async function handleAddBookSubmit(e) {
    e.preventDefault();
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const titleInput = document.getElementById('addBookTitle');
    const authorInput = document.getElementById('addBookAuthor');
    const categoryInput = document.getElementById('addBookCategory');
    const totalPagesInput = document.getElementById('addBookTotalPages');

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const category = categoryInput.value.trim();
    const totalPages = parseInt(totalPagesInput.value, 10);

    // Validation
    if (!title || !author || !category) {
        showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
        return;
    }
    if (isNaN(totalPages) || totalPages <= 0) {
        showToast('Tổng số trang sách phải là số nguyên dương lớn hơn 0!', 'error');
        totalPagesInput.focus();
        return;
    }

    // Gọi Backend API
    const result = await StorageService.createBook({
        title,
        author,
        category,
        totalPages
    });

    if (result && result.success) {
        closeModal('addBookModal');
        showToast(result.message || 'Đã thêm sách mới thành công!', 'success');
        loadUserBooks();
    } else {
        showToast((result && result.message) || 'Lỗi khi thêm sách!', 'error');
    }
}

/**
 * Xử lý sửa sách
 */
function openEditBookModal(bookId) {
    const book = allUserBooks.find(b => b.id == bookId);
    if (!book) return;

    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookCategory').value = book.category;
    document.getElementById('editBookTotalPages').value = book.totalPages;

    const readPagesHint = document.getElementById('editBookReadPagesHint');
    if (readPagesHint) {
        readPagesHint.textContent = `Cuốn sách này hiện đã đọc ${book.readPages} trang.`;
    }

    openModal('editBookModal');
}

async function handleEditBookSubmit(e) {
    e.preventDefault();
    const bookId = document.getElementById('editBookId').value;
    const title = document.getElementById('editBookTitle').value.trim();
    const author = document.getElementById('editBookAuthor').value.trim();
    const category = document.getElementById('editBookCategory').value.trim();
    const totalPages = parseInt(document.getElementById('editBookTotalPages').value, 10);

    if (!title || !author || !category) {
        showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
        return;
    }

    if (isNaN(totalPages) || totalPages <= 0) {
        showToast('Tổng số trang phải là số nguyên dương lớn hơn 0!', 'error');
        return;
    }

    const result = await StorageService.updateBook(bookId, {
        title,
        author,
        category,
        totalPages
    });

    if (result && result.success) {
        closeModal('editBookModal');
        showToast(result.message || 'Đã cập nhật cuốn sách thành công!', 'success');
        loadUserBooks();
    } else {
        showToast((result && result.message) || 'Lỗi khi sửa sách!', 'error');
    }
}

/**
 * Xử lý xóa sách
 */
function confirmDeleteBook(bookId) {
    const book = allUserBooks.find(b => b.id == bookId);
    if (!book) return;

    deleteBookTargetId = bookId;
    const msgEl = document.getElementById('deleteBookMessage');
    if (msgEl) {
        msgEl.innerHTML = `Bạn có chắc chắn muốn xóa cuốn sách <strong>"${escapeHtml(book.title)}"</strong>?<br><span style="color: var(--danger); font-size: 0.85rem;">Toàn bộ lịch sử đọc liên quan đến cuốn sách này cũng sẽ bị xóa.</span>`;
    }

    openModal('deleteBookModal');
}

async function executeDeleteBook() {
    if (!deleteBookTargetId) return;

    const result = await StorageService.deleteBook(deleteBookTargetId);
    closeModal('deleteBookModal');
    deleteBookTargetId = null;

    if (result && result.success) {
        showToast(result.message || 'Đã xóa cuốn sách thành công!', 'success');
        loadUserBooks();
    } else {
        showToast((result && result.message) || 'Lỗi khi xóa sách!', 'error');
    }
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
