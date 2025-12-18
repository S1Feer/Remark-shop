document.addEventListener('DOMContentLoaded', async function() {
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const logoutBtn = document.getElementById('logout-btn');

    // Загружаем данные с сервера
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const user = await response.json();
            if (nameInput) nameInput.value = user.name || '';
            if (emailInput) emailInput.value = user.email || '';
            if (phoneInput) phoneInput.value = user.phone || '';
        } else {
            // Если не залогинен - на вход
            window.location.href = 'login.html';
        }
    } catch (e) {
        console.error("Ошибка загрузки профиля", e);
    }

    // Кнопка Выход
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // В идеале тут нужен запрос на /api/logout, 
            // но для простоты просто кидаем на логин
            window.location.href = 'login.html';
        });
    }
});