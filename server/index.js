const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/images', express.static(path.join(__dirname, '../public/site/images')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, '../public/admin')));
app.use('/site/assets', express.static(path.join(__dirname, '../public/site')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/site'));

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ARO Website running at http://localhost:${PORT}`);
  console.log(`  CMS Admin at          http://localhost:${PORT}/admin\n`);
});