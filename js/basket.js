class BasketManager {
    constructor() {
        this.items = [];
    }

    async addToBasket(product) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_name: product.name,
                product_price: parseInt(product.price.replace(/\s/g, ''))
            })
        });

        if (response.status === 401) {
            // Если сервер сказал "не авторизован"
            alert('Чтобы добавить товар в корзину, необходимо войти в аккаунт');
            window.location.href = 'login.html'; // Перекидываем на вход
            return false;
        }

        if (response.ok) {
            await this.refreshGlobalCartCount();
            return true;
        }
    } catch (error) {
        console.error('Ошибка добавления:', error);
    }
    return false;
}

    async removeItem(cartId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: cartId })
            });
            if (response.ok) {
                await this.refreshGlobalCartCount(); // Это обновит цифру в шапке
                return true;
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
        return false;
    }

    async refreshGlobalCartCount() {
        try {
            const response = await fetch('/api/cart/count');
            const data = await response.json();
            const countElement = document.getElementById('basket-count');
            if (countElement) {
                const count = data.count || 0;
                countElement.textContent = count;
                countElement.style.display = count > 0 ? 'flex' : 'none';
                countElement.style.alignItems = 'center';
                countElement.style.justifyContent = 'center';
            }
        } catch (e) {
            console.error("Ошибка счетчика", e);
        }
    }

    showAddFeedback(button) {
        const originalText = button.textContent;
        button.textContent = '✓ ДОБАВЛЕНО';
        button.disabled = true;
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    }
}

window.Basket = new BasketManager();

document.addEventListener('DOMContentLoaded', () => {
    window.Basket.refreshGlobalCartCount();
    document.querySelectorAll('.add-to-basket').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-item');
            const product = {
                name: productCard.querySelector('.product-title')?.textContent || 'Товар',
                price: productCard.querySelector('.product-price')?.textContent || '0'
            };
            if (await window.Basket.addToBasket(product)) {
                window.Basket.showAddFeedback(button);
            }
        });
    });
});