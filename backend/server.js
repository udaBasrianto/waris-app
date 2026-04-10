import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import consultationRoutes from './routes/consultation.js';
import ustadRoutes from './routes/ustad.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/ustads', ustadRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
