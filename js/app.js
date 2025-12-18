// app.js - основной код
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт Ремарк загружен!');
    
    // Проверка работы корзины
    console.log('Товаров в корзине:', window.basket.getbasketItems().length);
});