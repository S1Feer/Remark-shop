const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3'); // Мы будем использовать его через драйвер

const app = express();
const dbPath = path.join(__dirname, 'remark.db');
const db = new sqlite3.Database(dbPath);

app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); 
app.use(session({
    secret: 'gothic-secret-key',
    resave: false,
    saveUninitialized: true
}));

// --- Создание таблиц ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        phone TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_name TEXT,
        price INTEGER
    )`);
    console.log("База данных подключена и таблицы проверены.");
});

// 1. Получение данных профиля
app.get('/api/profile', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
    db.get(`SELECT name, email, phone FROM users WHERE id = ?`, [req.session.userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "Не найден" });
        res.json(user);
    });
});

// 2. Добавление в корзину (БД)
app.post('/api/cart/add', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Войдите в аккаунт" });
    const { product_name, product_price } = req.body;
    db.run(`INSERT INTO cart (user_id, product_name, price) VALUES (?, ?, ?)`, 
    [req.session.userId, product_name, product_price], (err) => {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        res.json({ success: true });
    });
});

// 3. Получение товаров корзины
app.get('/api/cart', (req, res) => {
    if (!req.session.userId) return res.json([]);
    db.all(`SELECT * FROM cart WHERE user_id = ?`, [req.session.userId], (err, rows) => {
        res.json(rows || []);
    });
});

// --- API Регистрация ---
app.post('/api/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    db.run(`INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`, 
    [name, email, password, phone], function(err) {
        if (err) return res.status(400).json({ error: "Ошибка: возможно, такой Email уже есть" });
        req.session.userId = this.lastID;
        res.json({ success: true });
    });
});

// --- API Вход ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, user) => {
        if (user) {
            req.session.userId = user.id;
            res.json({ success: true, user: { name: user.name } });
        } else {
            res.status(401).json({ error: "Неверные данные" });
        }
    });
});

const PORT = process.env.PORT || 3000;
// Получение данных профиля
app.get('/api/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Не авторизован" });
    }

    db.get(`SELECT name, email, phone FROM users WHERE id = ?`, [req.session.userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "Пользователь не найден" });
        res.json(user);
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Получение количества товаров в корзине
app.get('/api/cart/count', (req, res) => {
    if (!req.session.userId) return res.json({ count: 0 });
    
    db.get(`SELECT SUM(1) as count FROM cart WHERE user_id = ?`, [req.session.userId], (err, row) => {
        res.json({ count: row ? row.count : 0 });
    });
});

// Удаление товара из корзины
app.post('/api/cart/remove', (req, res) => {
    if (!req.session.userId) return res.status(401).send('Нужна авторизация');
    
    const { id } = req.body; // Получаем ID записи из таблицы cart
    
    db.run(`DELETE FROM cart WHERE id = ? AND user_id = ?`, [id, req.session.userId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});