document.addEventListener('DOMContentLoaded', () => {
    // Nếu đã đăng nhập, tự động chuyển về Dashboard
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
        window.location.href = 'dashboard.html';
        return;
    }

    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    initDemoLoginButton();
});

/**
 * Toggle hiển thị/ẩn mật khẩu
 */
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.btn-toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (!input) return;

            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            } else {
                input.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });
}

/**
 * Hiển thị thông báo trên Auth card
 */
function setAuthAlert(elementId, message, type = 'error') {
    const alertEl = document.getElementById(elementId);
    if (!alertEl) return;

    alertEl.className = `auth-alert auth-alert-${type} visible`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    alertEl.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
}

function clearAuthAlert(elementId) {
    const alertEl = document.getElementById(elementId);
    if (!alertEl) return;
    alertEl.className = 'auth-alert';
    alertEl.innerHTML = '';
}

/**
 * Helper kiểm tra định dạng email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * XỬ LÝ FORM ĐĂNG NHẬP (login.html)
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthAlert('authAlert');

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validation phía client
        if (!email) {
            setAuthAlert('authAlert', 'Vui lòng nhập địa chỉ email của bạn.');
            emailInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            setAuthAlert('authAlert', 'Định dạng email không hợp lệ (ví dụ: user@example.com).');
            emailInput.focus();
            return;
        }

        if (!password) {
            setAuthAlert('authAlert', 'Vui lòng nhập mật khẩu.');
            passwordInput.focus();
            return;
        }

        // Gọi Backend API
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';

        const result = await StorageService.login(email, password);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Đăng Nhập';

        if (result && result.success) {
            setAuthAlert('authAlert', 'Đăng nhập thành công! Đang chuyển hướng...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        } else {
            setAuthAlert('authAlert', (result && result.message) || 'Email hoặc mật khẩu không chính xác!');
        }
    });
}

/**
 * XỬ LÝ FORM ĐĂNG KÝ (register.html)
 */
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthAlert('authAlert');

        const fullNameInput = document.getElementById('registerFullName');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('registerConfirmPassword');

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validation phía client
        if (!fullName || fullName.length < 2) {
            setAuthAlert('authAlert', 'Họ và tên phải có ít nhất 2 ký tự.');
            fullNameInput.focus();
            return;
        }

        if (!email || !isValidEmail(email)) {
            setAuthAlert('authAlert', 'Định dạng email không hợp lệ (ví dụ: user@example.com).');
            emailInput.focus();
            return;
        }

        if (!password || password.length < 6) {
            setAuthAlert('authAlert', 'Mật khẩu phải chứa ít nhất 6 ký tự.');
            passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            setAuthAlert('authAlert', 'Mật khẩu xác nhận không trùng khớp.');
            confirmPasswordInput.focus();
            return;
        }

        // Gọi Backend API đăng ký
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo tài khoản...';

        const result = await StorageService.register(fullName, email, password);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng Ký Tài Khoản';

        if (result && result.success) {
            setAuthAlert('authAlert', 'Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);
        } else {
            setAuthAlert('authAlert', (result && result.message) || 'Không thể tạo tài khoản!');
        }
    });
}

/**
 * Nút tự động điền tài khoản demo để trải nghiệm nhanh
 */
function initDemoLoginButton() {
    const btnDemo = document.getElementById('btnDemoLogin');
    if (!btnDemo) return;

    btnDemo.addEventListener('click', () => {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (emailInput && passwordInput) {
            emailInput.value = 'demo@reading.com';
            passwordInput.value = 'password123';

            const form = document.getElementById('loginForm');
            if (form) {
                setTimeout(() => {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 200);
            }
        }
    });
}
