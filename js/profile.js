/**
 * profile.js - Quản lý trang thông tin cá nhân của người dùng
 */

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    initProfileForm();
});

/**
 * Tải thông tin người dùng và các chỉ số tóm tắt
 */
function loadUserProfile() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    // Tải dữ liệu thống kê cá nhân
    const stats = StorageService.getUserStatistics(currentUser.id);
    const initials = getInitials(currentUser.fullName);

    // Cập nhật card đại diện
    const avatarEl = document.getElementById('profileLargeAvatar');
    const nameEl = document.getElementById('profileCardName');
    const emailEl = document.getElementById('profileCardEmail');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = currentUser.fullName;
    if (emailEl) emailEl.textContent = currentUser.email;

    // Mini stats
    const booksCount = document.getElementById('profileBooksCount');
    const pagesCount = document.getElementById('profilePagesCount');
    if (booksCount) booksCount.textContent = stats.totalBooks;
    if (pagesCount) pagesCount.textContent = stats.totalPagesRead.toLocaleString('vi-VN');

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

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const fullNameInput = document.getElementById('profileFullName');
        const newFullName = fullNameInput.value.trim();

        if (!newFullName) {
            showToast('Họ và tên không được để trống!', 'error');
            fullNameInput.focus();
            return;
        }

        if (newFullName.length < 2) {
            showToast('Họ và tên phải có ít nhất 2 ký tự!', 'error');
            fullNameInput.focus();
            return;
        }

        // Cập nhật vào Storage
        const updatedUser = StorageService.updateUser(currentUser.id, {
            fullName: newFullName
        });

        if (updatedUser) {
            showToast('Đã cập nhật thông tin cá nhân thành công!', 'success');
            
            // Cập nhật lại giao diện trang profile
            loadUserProfile();

            // Cập nhật lại Header & Sidebar ngay lập tức
            if (typeof initAppShell === 'function') {
                initAppShell();
            }
        } else {
            showToast('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại!', 'error');
        }
    });
}

/**
 * Format ngày giờ ISO
 */
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
