/**
 * profile.js - Quản lý trang thông tin cá nhân của người dùng qua API Flask
 */

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    initProfileForm();
});

/**
 * Tải thông tin người dùng và các chỉ số tóm tắt từ API
 */
async function loadUserProfile() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const initials = getInitials(currentUser.fullName);

    // Cập nhật card đại diện
    const avatarEl = document.getElementById('profileLargeAvatar');
    const nameEl = document.getElementById('profileCardName');
    const emailEl = document.getElementById('profileCardEmail');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = currentUser.fullName;
    if (emailEl) emailEl.textContent = currentUser.email;

    // Lấy số liệu thống kê từ API
    const stats = await StorageService.getDashboardStats();
    if (stats) {
        const booksCount = document.getElementById('profileBooksCount');
        const pagesCount = document.getElementById('profilePagesCount');
        if (booksCount) booksCount.textContent = stats.totalBooks;
        if (pagesCount) pagesCount.textContent = stats.totalPagesRead.toLocaleString('vi-VN');
    }

    // Điền dữ liệu vào form
    const inputFullName = document.getElementById('profileFullName');
    const inputEmail = document.getElementById('profileEmail');
    const inputCreatedAt = document.getElementById('profileCreatedAt');

    if (inputFullName) inputFullName.value = currentUser.fullName || '';
    if (inputEmail) inputEmail.value = currentUser.email || '';
    if (inputCreatedAt) {
        inputCreatedAt.value = formatDateTime(currentUser.createdAt);
    }
}

/**
 * Xử lý cập nhật thông tin cá nhân
 */
function initProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const fullNameInput = document.getElementById('profileFullName');
        const newFullName = fullNameInput.value.trim();

        if (!newFullName || newFullName.length < 2) {
            showToast('Họ và tên phải có ít nhất 2 ký tự!', 'error');
            fullNameInput.focus();
            return;
        }

        // Gọi Backend API cập nhật profile
        const result = await StorageService.updateProfile(newFullName);

        if (result && result.success) {
            showToast('Đã cập nhật thông tin cá nhân thành công!', 'success');
            
            // Cập nhật lại giao diện trang profile
            loadUserProfile();

            // Cập nhật lại Header & Sidebar
            if (typeof initAppShell === 'function') {
                initAppShell();
            }
        } else {
            showToast((result && result.message) || 'Lỗi khi cập nhật thông tin cá nhân!', 'error');
        }
    });
}

function formatDateTime(isoString) {
    if (!isoString) return 'Chưa rõ';
    try {
        const d = new Date(isoString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return isoString;
    }
}
