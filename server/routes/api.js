const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../data');

// ── File upload config ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ── Upload endpoint ──────────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ── GET full content ─────────────────────────────────────────────────────────
router.get('/content', (req, res) => res.json(db.read()));

// ── Site settings ─────────────────────────────────────────────────────────────
router.put('/site', (req, res) => {
  const data = db.read();
  data.site = { ...data.site, ...req.body };
  db.write(data);
  res.json(data.site);
});

// ── Stats ─────────────────────────────────────────────────────────────────────
router.put('/stats', (req, res) => {
  const data = db.read();
  data.stats = req.body;
  db.write(data);
  res.json(data.stats);
});

// ── Generic CRUD factory ──────────────────────────────────────────────────────
// Collections: campaigns, programmes, policy, international, films, news, reclaimers, partners
function crudRoutes(collection) {
  // List
  router.get(`/${collection}`, (req, res) => {
    res.json(db.read()[collection] || []);
  });

  // Create
  router.post(`/${collection}`, (req, res) => {
    const data = db.read();
    const item = { id: uuidv4(), ...req.body };
    // Ensure videos array exists for media-bearing collections
    if (['campaigns','programmes','policy','international','films'].includes(collection)) {
      if (!item.videos) item.videos = [];
    }
    data[collection].push(item);
    db.write(data);
    res.json(item);
  });

  // Update
  router.put(`/${collection}/:id`, (req, res) => {
    const data = db.read();
    const idx = data[collection].findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    data[collection][idx] = { ...data[collection][idx], ...req.body };
    db.write(data);
    res.json(data[collection][idx]);
  });

  // Delete
  router.delete(`/${collection}/:id`, (req, res) => {
    const data = db.read();
    data[collection] = data[collection].filter(i => i.id !== req.params.id);
    db.write(data);
    res.json({ ok: true });
  });
}

// Apply CRUD to all collections
['campaigns','programmes','policy','international','films','news','reclaimers','partners'].forEach(crudRoutes);

// ── Video management on section items ────────────────────────────────────────
// Add video to a section item (campaigns, programmes, policy, international)
router.post('/:collection/:id/videos', (req, res) => {
  const { collection, id } = req.params;
  const allowed = ['campaigns','programmes','policy','international'];
  if (!allowed.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });

  const data = db.read();
  const item = data[collection].find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const video = { id: uuidv4(), ...req.body };
  item.videos = item.videos || [];
  item.videos.push(video);
  db.write(data);
  res.json(video);
});

// Remove video from a section item
router.delete('/:collection/:id/videos/:videoId', (req, res) => {
  const { collection, id, videoId } = req.params;
  const data = db.read();
  const item = data[collection].find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.videos = (item.videos || []).filter(v => v.id !== videoId);
  db.write(data);
  res.json({ ok: true });
});

module.exports = router;