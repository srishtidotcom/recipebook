const db = require('../config/db');

// GET /api/comments/:recipeId
const getComments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at DESC`,
      [req.params.recipeId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/comments/:recipeId
const addComment = async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });

  try {
    const [result] = await db.query(
      'INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.recipeId, req.user.id, content.trim()]
    );
    const [rows] = await db.query(
      `SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [req.params.commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await db.query('DELETE FROM comments WHERE id = ?', [req.params.commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getComments, addComment, deleteComment };
