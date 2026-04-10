import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware, signToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email sudah terdaftar' });

    const userId = uuidv4();
    const profileId = uuidv4();
    const roleId = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    await db.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [userId, email, hash]);
    await db.query('INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)', [profileId, userId, full_name || '']);
    await db.query('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [roleId, userId, 'klien']);

    const token = signToken({ id: userId, email, role: 'klien' });
    res.status(201).json({ token, user: { id: userId, email, role: 'klien', full_name: full_name || '' } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Gagal mendaftar' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Email atau password salah' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' });

    const [roles] = await db.query('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
    const role = roles[0]?.role || 'klien';

    const [profiles] = await db.query('SELECT full_name, phone, avatar_url FROM profiles WHERE user_id = ?', [user.id]);
    const profile = profiles[0] || {};

    const token = signToken({ id: user.id, email: user.email, role });
    res.json({ token, user: { id: user.id, email: user.email, role, ...profile } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Gagal masuk' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });

    const [roles] = await db.query('SELECT role FROM user_roles WHERE user_id = ?', [req.user.id]);
    const [profiles] = await db.query('SELECT full_name, phone, avatar_url FROM profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      user: {
        id: users[0].id,
        email: users[0].email,
        role: roles[0]?.role || 'klien',
        ...(profiles[0] || {}),
      }
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// PUT /api/auth/password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

    const hash = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('UpdatePassword error:', err);
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

export default router;
