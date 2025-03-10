const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// デバッグ情報
console.log('Starting server...');
console.log(`PORT environment variable: ${process.env.PORT}`);
console.log(`Using port: ${PORT}`);
console.log(`Current directory: ${__dirname}`);

// 静的ファイルの提供
app.use(express.static(__dirname));

// ルートパスのハンドラを追加
app.get('/', (req, res) => {
  console.log('Root path requested');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// すべてのリクエストをindex.htmlにリダイレクト（SPA対応）
app.get('*', (req, res) => {
  console.log(`Path requested: ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// エラーハンドラ
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
