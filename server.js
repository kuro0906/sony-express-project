const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// 1. 環境設定：Render 優先，本地 3000 為輔
const PORT = process.env.PORT || 3000;

// 2. 載入資料：確保路徑相對於 server.js
const { data } = require('./data/lens.json');

// 3. 全域日誌 (Global Middleware)
app.use((req, res, next) => {
    const log = `[${new Date().toLocaleString()}] ${req.method} ${req.url}\n`;
    try {
        // 確保 access.log 寫在 server.js 同一層
        fs.appendFileSync(path.resolve(__dirname, 'access.log'), log);
    } catch (err) {
        console.error("日誌寫入失敗:", err.message);
    }
    next();
});

// 4. 靜態資源處理：對準 public 資料夾
app.use(express.static(path.resolve(__dirname, 'public')));

// 5. 動態產品頁面 (Dynamic Routing)
app.get('/product/:model.html', (req, res) => {
    const { model } = req.params;
    const product = data.find(item => item.model === model);

    if (!product) {
        return res.status(404)
            .set('Content-Type', 'text/html; charset=utf-8')
            .send('<h1>404 Not Found (找不到型號)</h1>');
    }

    res.send(`
        <div style="text-align:center; font-family:sans-serif; padding:50px;">
            <h1>Sony Product Info</h1>
            <hr>
            <h2>${product.name}</h2>
            <p>Model: ${product.model}</p>
            <img src="${product.imageUrl}" alt="${product.name}" style="width:400px; border:1px solid #ddd;">
            <br><br>
            <a href="/">回首頁</a>
        </div>
    `);
});

// 6. 安全性管理後台 (Route Authorization)
app.get('/admin', (req, res) => {
    const isAuth = req.query.code === '521';
    res.status(isAuth ? 200 : 403)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send(`<h1 style="text-align:center; margin-top:50px;">${isAuth ? 'Welcome to Admin (歡迎進入後台)' : 'Access Denied (暗號錯誤)'}</h1>
               <p style="text-align:center;"><a href="/">回首頁</a></p>`);
});

// 7. 萬用防呆路由 (Wildcard Route) - 必須放最後
app.all(/.*$/, (req, res) => {
    res.status(404)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send('<h1 style="text-align:center; padding-top:50px;">404 Not Found (抱歉，路徑不存在)</h1>');
});

// 啟動監聽
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});