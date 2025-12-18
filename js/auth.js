// auth.js - логика авторизации и регистрации через Node.js + SQLite
class AuthManager {
    constructor() {
        // Мы больше не храним юзера в localStorage, так как у нас есть сессии на сервере
        this.initForms();
    }
    
    // Инициализация форм
    initForms() {
        // Переключение между формами
        document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        
        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        
        // Показать/скрыть пароль
        document.getElementById('show-login-password')?.addEventListener('change', (e) => {
            const passwordField = document.getElementById('login-password');
            if(passwordField) passwordField.type = e.target.checked ? 'text' : 'password';
        });
        
        // Форма входа
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // Форма регистрации
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
    }
    
    showRegisterForm() {
        document.getElementById('login-form')?.classList.remove('active');
        document.getElementById('register-form')?.classList.add('active');
    }
    
    showLoginForm() {
        document.getElementById('register-form')?.classList.remove('active');
        document.getElementById('login-form')?.classList.add('active');
    }
    
    // Вход через API
    async login() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showError('Заполните все поля');
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Успешный вход -> на профиль
                window.location.href = 'profile.html';
            } else {
                this.showError(data.error || 'Неверный email или пароль');
            }
        } catch (error) {
            console.error(error);
            this.showError('Ошибка сети или сервера');
        }
    }
    
    // Регистрация через API
    async register() {
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;
        const agreement = document.getElementById('reg-agreement').checked;
        
        // Валидация
        if (!name || !email || !phone || !password) {
            this.showError('Заполните все обязательные поля');
            return;
        }
        if (password !== passwordConfirm) {
            this.showError('Пароли не совпадают');
            return;
        }
        if (password.length < 6) {
            this.showError('Пароль слишком короткий (мин. 6 симв.)');
            return;
        }
        if (!agreement) {
            this.showError('Нужно согласиться с правилами');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Сразу после регистрации сервер авторизует нас (через сессию)
                window.location.href = 'profile.html';
            } else if (response.status === 409) {
                this.showError('Пользователь с таким Email уже существует');
            } else {
                this.showError(data.error || 'Ошибка при регистрации');
            }
        } catch (error) {
            console.error(error);
            this.showError('Ошибка сети');
        }
    }

    showError(message) {
        alert(message);
    }
}

// Создаем и инициализируем
window.Auth = new AuthManager();