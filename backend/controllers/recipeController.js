const db = require('../config/db');
const slugify = require('slugify');

// YouTube video IDs are 11 characters and use letters, numbers, underscore, and hyphen.
const YOUTUBE_VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

const isValidYoutubeUrl = (url = '') => {
  if (!url) return true;
  const trimmed = url.trim();

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return YOUTUBE_VIDEO_ID_REGEX.test(id || '');
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') return YOUTUBE_VIDEO_ID_REGEX.test(parsed.searchParams.get('v') || '');
      if (parsed.pathname.startsWith('/embed/')) return YOUTUBE_VIDEO_ID_REGEX.test(parsed.pathname.split('/')[2] || '');
      if (parsed.pathname.startsWith('/shorts/')) return YOUTUBE_VIDEO_ID_REGEX.test(parsed.pathname.split('/')[2] || '');
    }

    return false;
  } catch {
    return false;
  }
};

const normalizeYoutubeUrl = (url) => {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed || null;
};

// GET /api/recipes  (with search + category filter)
const getRecipes = async (req, res) => {
  const { search, category, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];

  if (search) {
    where.push('(r.title LIKE ? OR r.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category && category !== 'all') {
    where.push('r.category = ?');
    params.push(category);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM recipes r ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT r.*, u.username, u.avatar
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ recipes: rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/recipes/featured
const getFeatured = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.username, u.avatar
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 6`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/recipes/:slug
const getRecipeBySlug = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.username, u.avatar, u.id as author_id
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       WHERE r.slug = ?`,
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Recipe not found' });

    const recipe = rows[0];
    recipe.ingredients = JSON.parse(recipe.ingredients || '[]');
    recipe.instructions = JSON.parse(recipe.instructions || '[]');
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/recipes/user/:userId
const getUserRecipes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.username FROM recipes r JOIN users u ON r.user_id = u.id WHERE r.user_id = ? ORDER BY r.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/recipes
const createRecipe = async (req, res) => {
  const { title, description, category, prep_time, cook_time, servings, ingredients, instructions, youtube_url } = req.body;
  if (!title || !category) return res.status(400).json({ message: 'Title and category required' });
  if (!isValidYoutubeUrl(youtube_url)) return res.status(400).json({ message: 'Invalid YouTube URL format. Use a valid youtube.com or youtu.be link.' });

  const image = req.file ? `/uploads/${req.file.filename}` : null;
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  try {
    while (true) {
      const [existing] = await db.query('SELECT id FROM recipes WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const [result] = await db.query(
      `INSERT INTO recipes (user_id, title, slug, description, category, prep_time, cook_time, servings, ingredients, instructions, image, youtube_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, title, slug, description, category,
        prep_time || 0, cook_time || 0, servings || 4,
        ingredients || '[]', instructions || '[]', image, normalizeYoutubeUrl(youtube_url),
      ]
    );

    res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/recipes/:id
const updateRecipe = async (req, res) => {
  const { title, description, category, prep_time, cook_time, servings, ingredients, instructions, youtube_url } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  if (!isValidYoutubeUrl(youtube_url)) return res.status(400).json({ message: 'Invalid YouTube URL format. Use a valid youtube.com or youtu.be link.' });

  try {
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Recipe not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const recipe = rows[0];
    const updatedTitle = title || recipe.title;
    const newSlug = slugify(updatedTitle, { lower: true, strict: true });

    const fields = [
      'title = ?', 'slug = ?', 'description = ?', 'category = ?',
      'prep_time = ?', 'cook_time = ?', 'servings = ?',
      'ingredients = ?', 'instructions = ?', 'youtube_url = ?'
    ];
    const values = [
      updatedTitle, newSlug, description || recipe.description,
      category || recipe.category, prep_time ?? recipe.prep_time,
      cook_time ?? recipe.cook_time, servings ?? recipe.servings,
      ingredients || recipe.ingredients, instructions || recipe.instructions,
      youtube_url !== undefined ? normalizeYoutubeUrl(youtube_url) : recipe.youtube_url,
    ];

    if (image) { fields.push('image = ?'); values.push(image); }
    values.push(req.params.id);

    await db.query(`UPDATE recipes SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ slug: newSlug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/recipes/:id
const deleteRecipe = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Recipe not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await db.query('DELETE FROM comments WHERE recipe_id = ?', [req.params.id]);
    await db.query('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRecipes, getFeatured, getRecipeBySlug, getUserRecipes, createRecipe, updateRecipe, deleteRecipe };
