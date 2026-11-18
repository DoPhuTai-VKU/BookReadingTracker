// Route Guard: Kiểm tra người dùng đã đăng nhập chưa
(function checkAuthGuard() {
    // Nếu đang ở trang login hoặc register thì auth.js sẽ xử lý
    const path = window.location.pathname.toLowerCase();
    const isAuthPage = path.includes('login.html') || path.includes('register.html');

    if (!isAuthPage) {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) {
            // Chưa đăng nhập -> Chuyển hướng về login
            const prefix = path.includes('/pages/') ? '' : 'pages/';
            window.location.href = prefix + 'login.html';
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initAppShell();
    initMobileMenu();
    initLogoutButtons();
});

/**
    khởi tạo giao diện
 */
function initAppShell() {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    // Cập nhật tên và avatar người dùng ở Header và Sidebar
    const userInitials = getInitials(currentUser.fullName || 'User');

    // Mini user card ở Sidebar
    const miniName = document.getElementById('sidebarUserName');
    const miniEmail = document.getElementById('sidebarUserEmail');
    const miniAvatar = document.getElementById('sidebarUserAvatar');
    if (miniName) miniName.textContent = currentUser.fullName;
    if (miniEmail) miniEmail.textContent = currentUser.email;
    if (miniAvatar) miniAvatar.textContent = userInitials;

    // Header user info
    const headerName = document.getElementById('headerUserName');
    const headerAvatar = document.getElementById('headerUserAvatar');
    if (headerName) headerName.textContent = currentUser.fullName;
    if (headerAvatar) headerAvatar.textContent = userInitials;

    // Active state cho Sidebar navigation item
    highlightActiveNavLink();
}

/**
 * Highlight nav-item tương ứng với trang hiện tại
 */
function highlightActiveNavLink() {
    const currentPath = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;

        const cleanHref = href.toLowerCase().replace('./', '').replace('../', '');
        if (currentPath.endsWith(cleanHref) || (cleanHref.includes('dashboard') && currentPath.endsWith('/'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Lấy ký tự viết tắt đại diện cho avatar
 */
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Xử lý mobile menu drawer
 */
function initMobileMenu() {
    const toggleBtn = document.getElementById('btnMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay && sidebar) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

/**
 * Đăng xuất tài khoản
 */
function initLogoutButtons() {
    const logoutBtns = document.querySelectorAll('.btn-logout, #btnLogout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?')) {
                if (typeof StorageService.logout === 'function') {
                    await StorageService.logout();
                } else {
                    StorageService.clearSession();
                }
                const isPages = window.location.pathname.includes('/pages/');
                window.location.href = isPages ? 'login.html' : 'pages/login.html';
            }
        });
    });
}

/**
 * ===================================================================
 * TOAST NOTIFICATION SYSTEM
 * ===================================================================
 */
function showToast(message, type = 'info', title = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-triangle-exclamation',
        info: 'fa-info-circle'
    };

    const titleMap = {
        success: title || 'Thành công',
        error: title || 'Lỗi',
        warning: title || 'Cảnh báo',
        info: title || 'Thông báo'
    };

    const iconClass = iconMap[type] || iconMap.info;
    const finalTitle = titleMap[type];

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${finalTitle}</div>
            <div class="toast-msg">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Kích hoạt animation xuất hiện
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Tự biến mất sau 3.5s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * ===================================================================
 * MODAL HELPERS
 * ===================================================================
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Global modal close handlers on click backdrop or close button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
    if (e.target.closest('.modal-close') || e.target.closest('[data-modal-close]')) {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
});
