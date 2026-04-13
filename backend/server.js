require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/comments', require('./routes/comments'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const ensureRecipeColumns = async () => {
  try {
    await db.query('ALTER TABLE recipes ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500)');
  } catch (err) {
    console.error('⚠️ Failed to ensure recipe schema columns:', err.message);
  }
};

ensureRecipeColumns().finally(() => {
  app.listen(PORT, () => console.log(`🚀 RecipeBook API running on http://localhost:${PORT}`));
});
