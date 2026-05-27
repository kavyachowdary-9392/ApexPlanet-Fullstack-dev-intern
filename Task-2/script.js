// ===============================
// FORM SWITCHING
// ===============================

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const signUpLink = document.getElementById('signUpLink');
const signInLink = document.getElementById('signInLink');

signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

signInLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// ===============================
// PASSWORD TOGGLE
// ===============================

function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (toggle && input) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.querySelector('i').classList.toggle('fa-eye');
            toggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
}

setupPasswordToggle('loginToggle', 'loginPassword');
setupPasswordToggle('signupToggle', 'signupPassword');
setupPasswordToggle('confirmToggle', 'confirmPassword');

// ===============================
// FORM VALIDATION
// ===============================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = this.form.querySelectorAll('.form-input, .form-check-input');
    }

    clearErrors() {
        this.fields.forEach(field => {
            field.classList.remove('is-invalid');
            const errorMsg = field.closest('.input-group-wrapper, .form-check')?.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.classList.add('d-none');
                errorMsg.textContent = '';
            }
        });
    }

    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-invalid');
            const errorContainer = field.closest('.input-group-wrapper, .form-check');
            if (errorContainer) {
                const errorMsg = errorContainer.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.textContent = message;
                    errorMsg.classList.remove('d-none');
                }
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPassword(password) {
        return password.length >= 8;
    }

    isStrongPassword(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongRegex.test(password);
    }

    validateLoginForm() {
        this.clearErrors();
        let isValid = true;

        // Email validation
        const email = document.getElementById('loginEmail').value.trim();
        if (!email) {
            this.showError('loginEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('loginEmail', 'Please enter a valid email');
            isValid = false;
        }

        // Password validation
        const password = document.getElementById('loginPassword').value;
        if (!password) {
            this.showError('loginPassword', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    validateSignupForm() {
        this.clearErrors();
        let isValid = true;

        // Full Name validation
        const fullName = document.getElementById('fullName').value.trim();
        if (!fullName) {
            this.showError('fullName', 'Full name is required');
            isValid = false;
        } else if (fullName.length < 3) {
            this.showError('fullName', 'Name must be at least 3 characters');
            isValid = false;
        }

        // Username validation
        const username = document.getElementById('username').value.trim();
        if (!username) {
            this.showError('username', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            this.showError('username', 'Username must be at least 3 characters');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            this.showError('username', 'Username can only contain letters, numbers, _, and -');
            isValid = false;
        }

        // Email validation
        const email = document.getElementById('signupEmail').value.trim();
        if (!email) {
            this.showError('signupEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('signupEmail', 'Please enter a valid email');
            isValid = false;
        }

        // Password validation
        const password = document.getElementById('signupPassword').value;
        if (!password) {
            this.showError('signupPassword', 'Password is required');
            isValid = false;
        } else if (!this.isValidPassword(password)) {
            this.showError('signupPassword', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Confirm Password validation
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (!confirmPassword) {
            this.showError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Terms & Conditions
        if (!document.getElementById('agreeTerms').checked) {
            this.showError('agreeTerms', 'You must agree to the terms and conditions');
            isValid = false;
        }

        return isValid;
    }
}

// ===============================
// FORM HANDLERS
// ===============================

const loginValidator = new FormValidator('loginFormElement');
const signupValidator = new FormValidator('signupFormElement');

// Login Form Submit
document.getElementById('loginFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (loginValidator.validateLoginForm()) {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Login attempt:', { email, password });
        showSuccessNotification('Login successful! Welcome back.');
        
        // Reset form
        setTimeout(() => {
            document.getElementById('loginFormElement').reset();
            loginValidator.clearErrors();
        }, 1500);
    }
});

// Signup Form Submit
document.getElementById('signupFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (signupValidator.validateSignupForm()) {
        const formData = {
            fullName: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value
        };
        
        console.log('Signup data:', formData);
        showSuccessModal();
        
        // Reset form
        setTimeout(() => {
            document.getElementById('signupFormElement').reset();
            signupValidator.clearErrors();
            updatePasswordStrength('');
        }, 2000);
    }
});

// ===============================
// REAL-TIME VALIDATION
// ===============================

// Login Email
document.getElementById('loginEmail').addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !loginValidator.isValidEmail(email)) {
        loginValidator.showError('loginEmail', 'Please enter a valid email');
    } else if (email) {
        this.classList.remove('is-invalid');
        const errorMsg = this.closest('.input-group-wrapper')?.querySelector('.error-message');
        if (errorMsg) errorMsg.classList.add('d-none');
    }
});

// Signup Full Name
document.getElementById('fullName').addEventListener('input', function() {
    if (this.value.length >= 3) {
        this.classList.remove('is-invalid');
        const errorMsg = this.closest('.input-group-wrapper')?.querySelector('.error-message');
        if (errorMsg) errorMsg.classList.add('d-none');
    }
});

// Username with AJAX check
const usernameInput = document.getElementById('username');
const usernameCheck = document.getElementById('usernameCheck');
let usernameCheckTimeout;

usernameInput.addEventListener('input', function() {
    clearTimeout(usernameCheckTimeout);
    const username = this.value.trim();

    if (username.length < 3) {
        usernameCheck.innerHTML = '';
        return;
    }

    // Simulate AJAX check
    usernameCheckTimeout = setTimeout(() => {
        // Simulate server check (dummy users)
        const dummyUsers = ['admin', 'user123', 'testuser', 'demo'];
        const exists = dummyUsers.includes(username.toLowerCase());

        if (exists) {
            usernameCheck.innerHTML = '<i class="fas fa-times-circle" style="color: #ff6b6b;"></i>';
            signupValidator.showError('username', 'Username already taken');
        } else {
            usernameCheck.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
            this.classList.remove('is-invalid');
            const errorMsg = this.closest('.input-group-wrapper')?.querySelector('.error-message');
            if (errorMsg) errorMsg.classList.add('d-none');
        }
    }, 500);
});

// Signup Email
document.getElementById('signupEmail').addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !signupValidator.isValidEmail(email)) {
        signupValidator.showError('signupEmail', 'Please enter a valid email');
    } else if (email) {
        this.classList.remove('is-invalid');
        const errorMsg = this.closest('.input-group-wrapper')?.querySelector('.error-message');
        if (errorMsg) errorMsg.classList.add('d-none');
    }
});

// ===============================
// PASSWORD STRENGTH INDICATOR
// ===============================

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#b2bec3';
        strengthText.textContent = 'Password strength';
        return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;

    // Character variety
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 15;

    // Cap at 100
    strength = Math.min(strength, 100);

    // Update bar
    strengthBar.style.width = strength + '%';

    if (strength < 40) {
        strengthBar.style.backgroundColor = '#ff6b6b';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#ff6b6b';
    } else if (strength < 70) {
        strengthBar.style.backgroundColor = '#ffd700';
        strengthText.textContent = 'Good';
        strengthText.style.color = '#ffd700';
    } else {
        strengthBar.style.backgroundColor = '#28a745';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#28a745';
    }
}

document.getElementById('signupPassword').addEventListener('input', function() {
    updatePasswordStrength(this.value);
});

// ===============================
// PASSWORD MATCH CHECK
// ===============================

function updatePasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchIndicator = document.getElementById('passwordMatch');

    if (!confirmPassword) {
        matchIndicator.innerHTML = '';
        return;
    }

    if (password === confirmPassword && password) {
        matchIndicator.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
        confirmPassword.classList.remove('is-invalid');
    } else if (password !== confirmPassword) {
        matchIndicator.innerHTML = '<i class="fas fa-times-circle" style="color: #ff6b6b;"></i>';
    }
}

document.getElementById('signupPassword').addEventListener('input', updatePasswordMatch);
document.getElementById('confirmPassword').addEventListener('input', updatePasswordMatch);

// ===============================
// NOTIFICATIONS
// ===============================

function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show';
    notification.role = 'alert';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        animation: slideInRight 0.5s ease-out;
        min-width: 300px;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <strong>Success!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function showSuccessModal() {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
}

// ===============================
// SOCIAL LOGIN BUTTONS
// ===============================

document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = btn.className.split('-')[1].charAt(0).toUpperCase() + btn.className.split('-')[1].slice(1);
        showSuccessNotification(`Redirecting to ${provider}...`);
    });
});

// ===============================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===============================
// KEYBOARD SHORTCUTS
// ===============================

document.addEventListener('keydown', (e) => {
    // Alt + L: Focus on login email
    if (e.altKey && e.key === 'l' && loginForm.classList.contains('active')) {
        document.getElementById('loginEmail').focus();
    }
    // Alt + S: Focus on signup email
    if (e.altKey && e.key === 's' && signupForm.classList.contains('active')) {
        document.getElementById('signupEmail').focus();
    }
});

// ===============================
// INITIAL SETUP
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    // Add accessibility attributes
    document.querySelectorAll('.form-input').forEach(input => {
        input.setAttribute('aria-required', 'true');
    });

    // Prevent form submission on Enter in social buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Load saved data if available
    const savedEmail = localStorage.getItem('lastEmail');
    if (savedEmail && document.getElementById('rememberMe').checked) {
        document.getElementById('loginEmail').value = savedEmail;
    }
});

// ===============================
// SAVE LOGIN DATA
// ===============================

document.getElementById('rememberMe').addEventListener('change', (e) => {
    if (e.target.checked) {
        const email = document.getElementById('loginEmail').value;
        if (email) {
            localStorage.setItem('lastEmail', email);
        }
    } else {
        localStorage.removeItem('lastEmail');
    }
});

// ===============================
// RESPONSIVE NAVBAR
// ===============================

const navbar = document.getElementById('mainNavbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = 'var(--shadow-md)';
    }
});

// ===============================
// FORM AUTO-FILL PREVENTION
// ===============================

document.querySelectorAll('input[type="password"]').forEach(input => {
    input.addEventListener('change', () => {
        // Browser will auto-fill, but we warn the user
        setTimeout(() => {
            const containers = document.querySelectorAll('.input-group-wrapper');
            containers.forEach(container => {
                const input = container.querySelector('input');
                if (input && input.value) {
                    input.classList.add('is-valid');
                }
            });
        }, 100);
    });
});

console.log('%cRKC Tech Solutions Auth System Loaded', 'color: #17a2b8; font-size: 16px; font-weight: bold;');
