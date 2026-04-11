import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import consultationRoutes from './routes/consultation.js';
import ustadRoutes from './routes/ustad.js';
import adminRoutes from './routes/admin.js';
import blogRoutes from './routes/blog.js';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.resolve('uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/ustads', ustadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);

// Public: Get active sliders
app.get('/api/sliders', async (_, res) => {
  try {
    const [sliders] = await db.query('SELECT * FROM sliders WHERE active = true ORDER BY sort_order ASC, created_at DESC');
    res.json(sliders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil slider' });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

