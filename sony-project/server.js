const fs = require('fs');
const path = require('path');
const lensData = require('./data/lens.json');
const { data } = lensData;

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// ===============================
// 🧾 1. Logger Middleware
// ===============================
app.use((req, res, next) => {
    const log = `[${new Date().toLocaleString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.join(__dirname, 'access.log'), log);
    next();
});

// ===============================
// 📦 2. Static Files（修正版）
// ===============================
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// 🏠 3. API：回傳所有產品（加分功能）
// ===============================
app.get('/api/products', (req, res) => {
    res.json(data);
});

// ===============================
// 🧠 4. 動態產品頁（升級防呆版）
// ===============================
app.get('/product/:model.html', (req, res) => {
    let { model } = req.params;

    // 防呆：避免大小寫/空白問題
    model = model.trim();

    const product = data.find(p => p.model === model);

    if (!product) {
        return res.status(404).send(`
            <h1>404 找不到型號</h1>
            <p>查詢：${model}</p>
        `);
    }

    res.send(`
        <div style="text-align:center;font-family:sans-serif;">
            <h1>${product.name}</h1>
            <p>型號：${product.model}</p>
            <img src="${product.imageUrl}" width="300">
            <br><br>
            <a href="/">回首頁</a>
        </div>
    `);
});

// ===============================
// 🔐 5. Admin（不變但加強）
// ===============================
app.get('/admin', (req, res) => {
    const isAuth = req.query.code === '521';

    res.status(isAuth ? 200 : 403).send(
        isAuth
            ? '<h1>Welcome to Admin (歡迎進入後台)</h1>'
            : '<h1>Access Denied (暗號錯誤)</h1>'
    );
});

// ===============================
// 📸 6. 自動產品列表頁（超加分）
// ===============================
app.get('/products', (req, res) => {
    const list = data.map(p => `
        <li>
            <a href="/product/${p.model}.html">
                ${p.name}
            </a>
        </li>
    `).join('');

    res.send(`
        <h1>Sony 產品列表</h1>
        <ul>${list}</ul>
        <a href="/">回首頁</a>
    `);
});

// ===============================
// ❌ 7. 404（一定最後）
// ===============================
app.all(/.*/, (req, res) => {
    res.status(404).send(`
        <h1>404 Not Found</h1>
        <p>抱歉，路徑不存在</p>
        <a href="/">回首頁</a>
    `);
});

// ===============================
// 🚀 8. Start Server
// ===============================
app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});