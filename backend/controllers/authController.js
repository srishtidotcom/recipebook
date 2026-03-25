const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// POST /api/auth/register
const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [
      email,
      username,
    ]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email or username already taken' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const user = { id: result.insertId, username, email };
    res.status(201).json({ token: generateToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const { password: _, ...safeUser } = user;
    res.json({ token: generateToken(safeUser), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, bio, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { username, bio } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const fields = [];
    const values = [];
    if (username) { fields.push('username = ?'); values.push(username); }
    if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
    if (avatar) { fields.push('avatar = ?'); values.push(avatar); }

    if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update' });
    values.push(req.user.id);

    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query(
      'SELECT id, username, email, bio, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile };
