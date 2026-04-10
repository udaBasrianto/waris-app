import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/profiles/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil profil' });
  }
});

// PUT /api/profiles/me
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    await db.query('UPDATE profiles SET full_name = ?, phone = ? WHERE user_id = ?', [full_name, phone, req.user.id]);
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
});

export default router;
