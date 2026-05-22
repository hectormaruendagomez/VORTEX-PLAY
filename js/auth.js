document.addEventListener('DOMContentLoaded', function() {
    setupAuthToggle();
    setupFormValidation();
    setupQuickLogin();
    checkExistingSession();
});

function setupAuthToggle() {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginToggle.addEventListener('click', function() {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
    });

    registerToggle.addEventListener('click', function() {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });
}

function checkExistingSession() {
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
    }
}

function setupFormValidation() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        clearErrors(loginForm);

        let valid = true;
        if (!email) {
            showInputError(emailInput, t('auth.error.email_required'));
            valid = false;
        } else if (!isValidEmail(email)) {
            showInputError(emailInput, t('auth.error.email_invalid'));
            valid = false;
        }
        if (!password) {
            showInputError(passwordInput, t('auth.error.password_required'));
            valid = false;
        }
        if (!valid) return;

        const users = JSON.parse(localStorage.getItem('usersData')) || [];
        const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert(`${t('auth.success.welcome')}, ${user.name}.`);
            window.location.href = 'dashboard.html';
        } else {
            showInputError(emailInput, t('auth.error.credentials'));
            showInputError(passwordInput, t('auth.error.credentials_hint'));
        }
    });

    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = getPasswordStrength(this.value);
            let hint = this.nextElementSibling;
            if (!hint || !hint.classList.contains('error-msg')) return;
            if (this.value.length === 0) {
                hint.textContent = '';
                hint.style.display = 'none';
                hint.style.color = '#e74c3c';
                return;
            }
            hint.style.display = 'block';
            if (strength === 'weak') {
                hint.textContent = t('auth.error.password_weak');
                hint.style.color = '#e74c3c';
            } else if (strength === 'medium') {
                hint.textContent = t('auth.error.password_medium');
                hint.style.color = '#f1c40f';
            } else {
                hint.textContent = t('auth.error.password_strong');
                hint.style.color = '#2ecc71';
            }
        });
    }

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nameInput = document.getElementById('registerName');
        const emailInput = document.getElementById('registerEmail');
        const passInput = document.getElementById('registerPassword');
        const confirmInput = document.getElementById('registerConfirm');
        const roleSelect = document.getElementById('registerRole');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passInput.value;
        const confirm = confirmInput.value;
        const role = roleSelect.value;

        clearErrors(registerForm);

        let valid = true;
        if (!name || name.length < 2) {
            showInputError(nameInput, t('auth.error.name_short'));
            valid = false;
        }
        if (!email) {
            showInputError(emailInput, t('auth.error.email_required'));
            valid = false;
        } else if (!isValidEmail(email)) {
            showInputError(emailInput, t('auth.error.email_invalid_ex'));
            valid = false;
        }
        if (password.length < 8) {
            showInputError(passInput, t('auth.error.password_min'));
            valid = false;
        }
        if (password !== confirm) {
            showInputError(confirmInput, t('auth.error.passwords_mismatch'));
            valid = false;
        }
        if (!valid) return;

        const users = JSON.parse(localStorage.getItem('usersData')) || [];
        if (users.some(u => u.email.toLowerCase() === email)) {
            showInputError(emailInput, t('auth.error.email_taken'));
            return;
        }

        const settings = JSON.parse(localStorage.getItem('platformSettings')) || { allowRegistration: true };
        if (!settings.allowRegistration) {
            alert(t('auth.error.reg_disabled'));
            return;
        }

        const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        users.push({ email, password, name, role, avatar: avatar || 'US' });
        localStorage.setItem('usersData', JSON.stringify(users));

        alert(t('auth.success.register'));
        registerForm.reset();
        document.getElementById('loginToggle').click();
        document.getElementById('loginEmail').value = email;
    });

    setupRealtimeValidation(loginForm);
    setupRealtimeValidation(registerForm);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password) {
    if (password.length < 8) return 'weak';
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (hasNumber && (hasSymbol || hasUpper)) return 'strong';
    return 'medium';
}

function setupRealtimeValidation(form) {
    form.querySelectorAll('input[required], select[required]').forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = 'rgba(0, 212, 255, 0.4)';
            }
        });
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                const errorEl = this.nextElementSibling;
                if (errorEl && errorEl.classList.contains('error-msg') && this.id !== 'registerPassword') {
                    errorEl.textContent = '';
                    errorEl.style.display = 'none';
                }
            }
        });
    });
}

function setupQuickLogin() {
    const cards = document.querySelectorAll('.quick-login-card');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginForm = document.getElementById('loginForm');

    cards.forEach(card => {
        card.addEventListener('click', function() {
            emailInput.value = this.getAttribute('data-email');
            passwordInput.value = this.getAttribute('data-password');

            this.style.transform = 'scale(0.95)';
            this.style.background = 'rgba(0, 212, 255, 0.2)';

            setTimeout(() => {
                this.style.transform = '';
                this.style.background = '';
                loginForm.dispatchEvent(new Event('submit'));
            }, 300);
        });
    });
}

function showInputError(inputElement, message) {
    inputElement.style.borderColor = '#e74c3c';
    inputElement.style.boxShadow = '0 0 10px rgba(230, 76, 60, 0.3)';
    const errorSpan = inputElement.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-msg')) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
}

function clearErrors(formElement) {
    formElement.querySelectorAll('input, select').forEach(input => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    });
    formElement.querySelectorAll('.error-msg').forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
}
