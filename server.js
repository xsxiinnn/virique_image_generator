// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 靜態檔案：前端頁面 & 邊框圖片
app.use(express.static(path.join(__dirname, 'public')));

// 用來存上傳後的圖片
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// uploads 也要對外開放，讓別人能用網址存取圖片
app.use('/uploads', express.static(uploadDir));

// 解析 JSON，允許圖片 base64 比較大一點
app.use(express.json({ limit: '10mb' }));

// 上傳圖片 API：接收 dataURL，存成檔案，回傳網址
app.post('/api/upload-image', (req, res) => {
  const { imageData } = req.body;

  if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image data' });
  }

  // data:image/jpeg;base64,xxxxxx  → 拿逗號後面那段
  const base64Data = imageData.split(',')[1];

  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFile(filePath, buffer, err => {
    if (err) {
      console.error('寫入檔案失敗：', err);
      return res.status(500).json({ error: 'Fail to save file' });
    }

    // 對外可存取的網址（相對路徑）
    const fileUrl = `/uploads/${fileName}`;
    res.json({ url: fileUrl });
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});