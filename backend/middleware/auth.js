import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'konsultasi-faraidh-secret-key-2026';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Akses hanya untuk admin' });
  }
  next();
}

export function ustadOrAdmin(req, res, next) {
  if (req.user?.role !== 'ustad' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Akses hanya untuk ustad/admin' });
  }
  next();
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
