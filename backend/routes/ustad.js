import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/ustads — public list of ustads
router.get('/', async (_req, res) => {
  try {
    const [profiles] = await db.query(
      `SELECT up.user_id, up.specialization, up.available, up.bio,
              p.full_name
       FROM ustad_profiles up
       JOIN profiles p ON up.user_id = p.user_id`
    );

    // Fetch ratings and consultation counts
    if (profiles.length === 0) return res.json([]);

    const userIds = profiles.map(p => p.user_id);
    const [ratings] = await db.query('SELECT ustad_id, score FROM ratings WHERE ustad_id IN (?)', [userIds]);
    const [consults] = await db.query('SELECT ustad_id FROM consultations WHERE ustad_id IN (?) AND status = "completed"', [userIds]);

    // Build maps
    const ratingMap = {};
    ratings.forEach(r => {
      if (!ratingMap[r.ustad_id]) ratingMap[r.ustad_id] = [];
      ratingMap[r.ustad_id].push(r.score);
    });
    const consultMap = {};
    consults.forEach(c => {
      consultMap[c.ustad_id] = (consultMap[c.ustad_id] || 0) + 1;
    });

    const result = profiles.map(p => ({
      user_id: p.user_id,
      name: p.full_name || 'Ustad',
      specialty: p.specialization || 'Konsultan Faraidh',
      bio: p.bio || '',
      available: p.available || false,
      rating: ratingMap[p.user_id]
        ? +(ratingMap[p.user_id].reduce((a, b) => a + b, 0) / ratingMap[p.user_id].length).toFixed(1)
        : 0,
      consultations: consultMap[p.user_id] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil daftar ustad' });
  }
});

// GET /api/ustads/:id — public ustad detail
router.get('/:id', async (req, res) => {
  try {
    const [up] = await db.query('SELECT * FROM ustad_profiles WHERE user_id = ?', [req.params.id]);
    if (up.length === 0) return res.status(404).json({ error: 'Ustad tidak ditemukan' });

    const [prof] = await db.query('SELECT full_name FROM profiles WHERE user_id = ?', [req.params.id]);
    const [ratingData] = await db.query(
      'SELECT r.id, r.score, r.comment, r.created_at, r.client_id, p.full_name as client_name FROM ratings r LEFT JOIN profiles p ON r.client_id = p.user_id WHERE r.ustad_id = ? ORDER BY r.created_at DESC',
      [req.params.id]
    );
    const [consultCount] = await db.query(
      'SELECT COUNT(*) as count FROM consultations WHERE ustad_id = ? AND status = "completed"',
      [req.params.id]
    );

    const avgRating = ratingData.length
      ? ratingData.reduce((s, r) => s + r.score, 0) / ratingData.length
      : 0;

    res.json({
      ...up[0],
      full_name: prof[0]?.full_name || 'Ustad',
      ratings: ratingData.map(r => ({
        id: r.id,
        score: r.score,
        comment: r.comment || '',
        created_at: r.created_at,
        client_name: r.client_name || 'Anonim',
      })),
      avg_rating: avgRating,
      consultation_count: consultCount[0]?.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil detail ustad' });
  }
});

// PUT /api/ustads/profile — ustad update own profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { bio, specialization, available } = req.body;
    await db.query(
      'UPDATE ustad_profiles SET bio = ?, specialization = ?, available = ? WHERE user_id = ?',
      [bio, specialization, available, req.user.id]
    );
    res.json({ message: 'Profil ustad diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
});

// GET /api/ustads/:id/availability
router.get('/:id/availability', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ustad_availability WHERE ustad_id = ? ORDER BY day_of_week, start_time',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil ketersediaan' });
  }
});

// POST /api/ustads/:id/availability
router.post('/:id/availability', authMiddleware, async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO ustad_availability (id, ustad_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [id, req.params.id, day_of_week, start_time, end_time]
    );
    res.status(201).json({ id, message: 'Ketersediaan ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah ketersediaan' });
  }
});

// DELETE /api/ustads/:id/availability/:aid
router.delete('/:id/availability/:aid', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM ustad_availability WHERE id = ?', [req.params.aid]);
    res.json({ message: 'Ketersediaan dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus ketersediaan' });
  }
});

// GET /api/ustads/:id/bookings
router.get('/:id/bookings', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM consultation_bookings WHERE ustad_id = ? AND status = "scheduled" ORDER BY booking_date, start_time',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil booking' });
  }
});

// POST /api/ustads/:id/bookings
router.post('/:id/bookings', authMiddleware, async (req, res) => {
  try {
    const { booking_date, start_time, end_time, notes } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO consultation_bookings (id, ustad_id, booking_date, start_time, end_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.params.id, booking_date, start_time, end_time, notes || '']
    );
    res.status(201).json({ id, message: 'Booking ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah booking' });
  }
});

// PUT /api/ustads/:id/bookings/:bid
router.put('/:id/bookings/:bid', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE consultation_bookings SET status = ? WHERE id = ?', [status, req.params.bid]);
    res.json({ message: 'Booking diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui booking' });
  }
});

export default router;
