import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/consultations — list my consultations (as client or ustad)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query, params;
    if (role === 'admin') {
      query = 'SELECT * FROM consultations ORDER BY updated_at DESC';
      params = [];
    } else if (role === 'ustad') {
      query = 'SELECT * FROM consultations WHERE ustad_id = ? OR (status = "pending" AND ustad_id IS NULL) ORDER BY updated_at DESC';
      params = [req.user.id];
    } else {
      query = 'SELECT * FROM consultations WHERE client_id = ? ORDER BY updated_at DESC';
      params = [req.user.id];
    }
    const [rows] = await db.query(query, params);

    // Fetch ustad names
    const ustadIds = [...new Set(rows.filter(c => c.ustad_id).map(c => c.ustad_id))];
    let ustadMap = {};
    if (ustadIds.length > 0) {
      const [names] = await db.query('SELECT user_id, full_name FROM profiles WHERE user_id IN (?)', [ustadIds]);
      ustadMap = Object.fromEntries(names.map(n => [n.user_id, n.full_name || 'Ustad']));
    }

    const result = rows.map(c => ({ ...c, ustad_name: c.ustad_id ? (ustadMap[c.ustad_id] || 'Ustad') : null }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil konsultasi' });
  }
});

// POST /api/consultations — create new consultation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topik wajib diisi' });
    const id = uuidv4();
    await db.query('INSERT INTO consultations (id, client_id, topic) VALUES (?, ?, ?)', [id, req.user.id, topic]);
    const [rows] = await db.query('SELECT * FROM consultations WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat konsultasi' });
  }
});

// GET /api/consultations/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM consultations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Konsultasi tidak ditemukan' });

    const consultation = rows[0];
    // Get the other person's name
    const otherId = consultation.client_id === req.user.id ? consultation.ustad_id : consultation.client_id;
    let otherName = null;
    if (otherId) {
      const [profiles] = await db.query('SELECT full_name FROM profiles WHERE user_id = ?', [otherId]);
      otherName = profiles[0]?.full_name || null;
    }

    res.json({ ...consultation, other_name: otherName });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil konsultasi' });
  }
});

// PUT /api/consultations/:id — update status / assign ustad
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, ustad_id } = req.body;
    const updates = [];
    const params = [];
    if (status) { updates.push('status = ?'); params.push(status); }
    if (ustad_id) { updates.push('ustad_id = ?'); params.push(ustad_id); }
    if (updates.length === 0) return res.status(400).json({ error: 'Tidak ada data untuk diupdate' });

    params.push(req.params.id);
    await db.query(`UPDATE consultations SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await db.query('SELECT * FROM consultations WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengupdate konsultasi' });
  }
});

// GET /api/consultations/:id/messages
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil pesan' });
  }
});

// POST /api/consultations/:id/messages
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    const id = uuidv4();
    await db.query(
      'INSERT INTO messages (id, consultation_id, sender_id, content) VALUES (?, ?, ?, ?)',
      [id, req.params.id, req.user.id, content]
    );
    // Update consultation updated_at
    await db.query('UPDATE consultations SET updated_at = NOW() WHERE id = ?', [req.params.id]);
    const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengirim pesan' });
  }
});

// Ustad-specific routes
// GET /api/consultations/ustad/pending
router.get('/ustad/pending', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, p.full_name as client_name FROM consultations c LEFT JOIN profiles p ON c.client_id = p.user_id WHERE c.status = "pending" AND c.ustad_id IS NULL ORDER BY c.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil konsultasi pending' });
  }
});

// GET /api/consultations/ustad/mine
router.get('/ustad/mine', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, p.full_name as client_name FROM consultations c LEFT JOIN profiles p ON c.client_id = p.user_id WHERE c.ustad_id = ? ORDER BY c.updated_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil konsultasi' });
  }
});

// GET /api/consultations/ustad/stats
router.get('/ustad/stats', authMiddleware, async (req, res) => {
  try {
    const [consults] = await db.query('SELECT status FROM consultations WHERE ustad_id = ?', [req.user.id]);
    const [ratings] = await db.query('SELECT score FROM ratings WHERE ustad_id = ?', [req.user.id]);

    const total = consults.length;
    const active = consults.filter(c => c.status === 'active').length;
    const completed = consults.filter(c => c.status === 'completed').length;
    const avgRating = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;

    res.json({ total, active, completed, avgRating });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});

export default router;
