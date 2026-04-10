import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT user_id, full_name, phone, created_at FROM profiles');
    const [roles] = await db.query('SELECT user_id, role FROM user_roles');
    const roleMap = Object.fromEntries(roles.map(r => [r.user_id, r.role]));

    const users = profiles.map(p => ({
      user_id: p.user_id,
      full_name: p.full_name,
      phone: p.phone,
      role: roleMap[p.user_id] || 'klien',
      created_at: p.created_at,
    }));
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil daftar user' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'ustad', 'klien'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }
    await db.query('UPDATE user_roles SET role = ? WHERE user_id = ?', [role, req.params.id]);
    res.json({ message: 'Role berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengubah role' });
  }
});

// GET /api/admin/ustads — list ustad profiles
router.get('/ustads', async (req, res) => {
  try {
    const [ups] = await db.query('SELECT * FROM ustad_profiles');
    if (ups.length === 0) return res.json([]);

    const userIds = ups.map(u => u.user_id);
    const [names] = await db.query('SELECT user_id, full_name FROM profiles WHERE user_id IN (?)', [userIds]);
    const nameMap = Object.fromEntries(names.map(n => [n.user_id, n.full_name || '—']));

    const result = ups.map(u => ({
      user_id: u.user_id,
      bio: u.bio || '',
      specialization: u.specialization || '',
      available: u.available || false,
      full_name: nameMap[u.user_id] || '—',
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil profil ustad' });
  }
});

// POST /api/admin/ustads — create ustad profile
router.post('/ustads', async (req, res) => {
  try {
    const { user_id, bio, specialization, available } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID wajib' });

    const id = uuidv4();
    await db.query(
      'INSERT INTO ustad_profiles (id, user_id, bio, specialization, available) VALUES (?, ?, ?, ?, ?)',
      [id, user_id, bio || '', specialization || '', available || false]
    );
    // Ensure role is ustad
    await db.query('UPDATE user_roles SET role = "ustad" WHERE user_id = ?', [user_id]);
    res.status(201).json({ message: 'Profil ustad ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah profil ustad' });
  }
});

// PUT /api/admin/ustads/:id
router.put('/ustads/:id', async (req, res) => {
  try {
    const { bio, specialization, available } = req.body;
    await db.query(
      'UPDATE ustad_profiles SET bio = ?, specialization = ?, available = ? WHERE user_id = ?',
      [bio, specialization, available, req.params.id]
    );
    res.json({ message: 'Profil ustad diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui profil ustad' });
  }
});

// DELETE /api/admin/ustads/:id
router.delete('/ustads/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ustad_profiles WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'Profil ustad dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus profil ustad' });
  }
});

// ============ SLIDERS ============

// GET /api/admin/sliders — list all sliders
router.get('/sliders', async (req, res) => {
  try {
    const [sliders] = await db.query('SELECT * FROM sliders ORDER BY sort_order ASC, created_at DESC');
    res.json(sliders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data slider' });
  }
});

// POST /api/admin/sliders — create slider
router.post('/sliders', async (req, res) => {
  try {
    const { title, description, image_url, link_url, active, sort_order } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Judul dan URL gambar wajib diisi' });

    const id = uuidv4();
    await db.query(
      'INSERT INTO sliders (id, title, description, image_url, link_url, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description || '', image_url, link_url || '', active !== false, sort_order || 0]
    );
    res.status(201).json({ message: 'Slider ditambahkan', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah slider' });
  }
});

// PUT /api/admin/sliders/:id — update slider
router.put('/sliders/:id', async (req, res) => {
  try {
    const { title, description, image_url, link_url, active, sort_order } = req.body;
    await db.query(
      'UPDATE sliders SET title = ?, description = ?, image_url = ?, link_url = ?, active = ?, sort_order = ? WHERE id = ?',
      [title, description || '', image_url, link_url || '', active !== false, sort_order || 0, req.params.id]
    );
    res.json({ message: 'Slider diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui slider' });
  }
});

// DELETE /api/admin/sliders/:id — delete slider
router.delete('/sliders/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM sliders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Slider dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus slider' });
  }
});

export default router;

