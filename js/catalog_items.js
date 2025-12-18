// catalog_items.js - обработка добавления в корзину

document.addEventListener('DOMContentLoaded', function() {
    const addToBasketButtons = document.querySelectorAll('.add-to-basket');
    const basketCount = document.getElementById('basket-count');
    
    // Функция для обновления счетчика корзины
    function updateBasketCount() {
        const basket = JSON.parse(localStorage.getItem('basket') || '[]');
        if (basketCount) {
            basketCount.textContent = basket.length;
        }
    }
    
    // Инициализация счетчика
    updateBasketCount();
    
    // Обработка добавления в корзину
    addToBasketButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productCard = this.closest('.product-item');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImage = productCard.querySelector('.product-image').src;
            
            // Получаем текущую корзину
            let basket = JSON.parse(localStorage.getItem('basket') || '[]');
            
            // Проверяем, есть ли уже такой товар в корзине
            const existingItem = basket.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                // Добавляем новый товар
                basket.push({
                    id: productId,
                    name: productName,
                    price: productPrice.replace(' ₽', ''),
                    image: productImage,
                    quantity: 1
                });
            }
            
            // Сохраняем обновленную корзину
            localStorage.setItem('basket', JSON.stringify(basket));
            
            // Обновляем счетчик
            updateBasketCount();
            
            // Анимация кнопки
            const originalText = this.textContent;
            this.textContent = '✓ ДОБАВЛЕНО';
            this.style.background = 'linear-gradient(145deg, rgb(0, 100, 0), rgb(0, 70, 0))';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = 'linear-gradient(145deg, rgb(154, 23, 41), rgb(120, 0, 30))';
            }, 1500);
        });
    });
});