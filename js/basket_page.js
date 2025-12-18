async function renderBasket() {
    const container = document.getElementById('basket-items');
    const totalElement = document.getElementById('total-price');
    const subtotalElement = document.getElementById('subtotal-price');
    const deliveryElement = document.getElementById('delivery-price');
    
    // Находим кнопку оформления заказа
    const checkoutBtn = document.getElementById('checkout-btn');

    try {
        const response = await fetch('/api/cart');
        const items = await response.json();

        if (window.Basket) window.Basket.refreshGlobalCartCount();

        // ПРОВЕРКА: Если корзина пуста
        if (!items || items.length === 0) {
            container.innerHTML = '<div class="empty-basket"><h3>Корзина пуста</h3></div>';
            
            // Делаем кнопку неактивной
            if (checkoutBtn) {
                checkoutBtn.disabled = true;             // Выключаем саму кнопку
                checkoutBtn.style.opacity = '0.5';       // Делаем полупрозрачной
                checkoutBtn.style.cursor = 'not-allowed'; // Меняем курсор на "запрещено"
            }

            if (subtotalElement) subtotalElement.textContent = '0 ₽';
            if (deliveryElement) deliveryElement.textContent = '0 ₽';
            if (totalElement) totalElement.textContent = '0 ₽';
            return;
        }

        // Если товары ЕСТЬ — активируем кнопку обратно
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }

        let subtotal = 0;
        container.innerHTML = items.map(item => {
            subtotal += item.price;
            return `
                <div class="basket-item">
                    <div class="basket-item-info">
                        <h4 class="basket-item-name">${item.product_name}</h4>
                        <div class="basket-item-price">${item.price} ₽</div>
                    </div>
                    <button class="remove-btn" onclick="handleDelete(${item.id})">Удалить</button>
                </div>
            `;
        }).join('');

        const deliveryCost = subtotal >= 5000 ? 0 : 350;
        const finalTotal = subtotal + deliveryCost;

        if (subtotalElement) subtotalElement.textContent = `${subtotal} ₽`;
        if (deliveryElement) {
            deliveryElement.textContent = deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`;
            deliveryElement.style.color = deliveryCost === 0 ? '#00ff00' : '#fff';
        }
        if (totalElement) totalElement.textContent = `${finalTotal} ₽`;

    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

// Удаление товара
window.handleDelete = async (id) => {
    const success = await window.Basket.removeItem(id);
    if (success) {
        await renderBasket(); 
    }
};

// Обработчик клика на кнопку заказа
document.getElementById('checkout-btn')?.addEventListener('click', (e) => {
    // Если кнопка не disabled, показываем сообщение об успехе
    alert('Заказ успешно оформлен! Наш менеджер свяжется с вами.');
    
    // Тут можно добавить очистку корзины на сервере, если захочешь
});

document.addEventListener('DOMContentLoaded', renderBasket);