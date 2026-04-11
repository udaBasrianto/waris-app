import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Middleware to check if user is admin or ustad
const requireAdminOrUstad = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'ustad')) {
    next();
  } else {
    res.status(403).json({ error: 'Akses ditolak' });
  }
};

// ========================
// PUBLIC ROUTES
// ========================

// GET /api/blog/categories - Get all categories
router.get('/categories', async (_req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil kategori' });
  }
});

// GET /api/blog - Get all published posts
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, p.published_at,
             pr.full_name as author_name
      FROM posts p
      LEFT JOIN profiles pr ON p.author_id = pr.user_id
      WHERE p.status = 'published'
    `;
    const params = [];
    
    if (category) {
      query += ` AND p.id IN (SELECT post_id FROM post_categories JOIN categories ON category_id = categories.id WHERE categories.slug = ?)`;
      params.push(category);
    }
    
    query += ` ORDER BY p.published_at DESC`;
    
    const [posts] = await db.query(query, params);
    
    // fetch categories for each post
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const [cats] = await db.query(`
        SELECT pc.post_id, c.name, c.slug 
        FROM post_categories pc 
        JOIN categories c ON pc.category_id = c.id 
        WHERE pc.post_id IN (?)
      `, [postIds]);
      
      const catMap = {};
      cats.forEach(c => {
        if (!catMap[c.post_id]) catMap[c.post_id] = [];
        catMap[c.post_id].push({ name: c.name, slug: c.slug });
      });
      
      posts.forEach(p => {
        p.categories = catMap[p.id] || [];
      });
    }

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil artikel blog' });
  }
});

// GET /api/blog/:slug - Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const [post] = await db.query(`
      SELECT p.*, pr.full_name as author_name 
      FROM posts p 
      LEFT JOIN profiles pr ON p.author_id = pr.user_id 
      WHERE p.slug = ? AND p.status = 'published'
    `, [req.params.slug]);

    if (post.length === 0) return res.status(404).json({ error: 'Artikel tidak ditemukan' });

    const [cats] = await db.query(`
        SELECT c.id, c.name, c.slug 
        FROM post_categories pc 
        JOIN categories c ON pc.category_id = c.id 
        WHERE pc.post_id = ?
    `, [post[0].id]);

    post[0].categories = cats;
    res.json(post[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil artikel' });
  }
});

// ========================
// ADMIN/USTAD ROUTES
// ========================

// GET /api/blog/admin/posts - Get all posts (including drafts)
router.get('/admin/posts', authMiddleware, requireAdminOrUstad, async (req, res) => {
  try {
    let query = `
      SELECT p.id, p.title, p.slug, p.status, p.created_at, p.published_at, pr.full_name as author_name
      FROM posts p
      LEFT JOIN profiles pr ON p.author_id = pr.user_id
    `;
    const params = [];

    // Ustad can only see their own posts, Admin can see all
    if (req.user.role === 'ustad') {
      query += ` WHERE p.author_id = ?`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY p.created_at DESC`;

    const [posts] = await db.query(query, params);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil daftar artikel' });
  }
});

// GET /api/blog/admin/posts/:id - Get single post for editing
router.get('/admin/posts/:id', authMiddleware, requireAdminOrUstad, async (req, res) => {
    try {
      let query = `SELECT * FROM posts WHERE id = ?`;
      const params = [req.params.id];
  
      if (req.user.role === 'ustad') {
        query += ` AND author_id = ?`;
        params.push(req.user.id);
      }
      
      const [post] = await db.query(query, params);
      if (post.length === 0) return res.status(404).json({ error: 'Artikel tidak ditemukan atau tidak ada akses' });
  
      const [cats] = await db.query(`SELECT category_id FROM post_categories WHERE post_id = ?`, [post[0].id]);
      post[0].category_ids = cats.map(c => c.category_id);
  
      res.json(post[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil artikel' });
    }
  });

// POST /api/blog/categories - Create category
router.post('/categories', authMiddleware, requireAdminOrUstad, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const id = uuidv4();
    await db.query('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [id, name, slug]);
    res.status(201).json({ id, message: 'Kategori ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah kategori (slug mungkin duplikat)' });
  }
});

// POST /api/blog/posts - Create post
router.post('/posts', authMiddleware, requireAdminOrUstad, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featured_image, status, category_ids } = req.body;
    const id = uuidv4();
    const published_at = status === 'published' ? new Date() : null;

    await db.query(
      `INSERT INTO posts (id, title, slug, content, excerpt, featured_image, author_id, status, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, slug, content, excerpt, featured_image, req.user.id, status, published_at]
    );

    if (category_ids && category_ids.length > 0) {
      const catValues = category_ids.map(cid => [id, cid]);
      await db.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [catValues]);
    }

    res.status(201).json({ id, message: 'Artikel dibuat' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat artikel (slug mungkin duplikat)' });
  }
});

// PUT /api/blog/posts/:id - Update post
router.put('/posts/:id', authMiddleware, requireAdminOrUstad, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featured_image, status, category_ids } = req.body;
    
    // Check permission
    const [exist] = await db.query('SELECT author_id, status, published_at FROM posts WHERE id = ?', [req.params.id]);
    if (exist.length === 0) return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    if (req.user.role === 'ustad' && exist[0].author_id !== req.user.id) {
        return res.status(403).json({ error: 'Akses ditolak' });
    }

    let published_at = exist[0].published_at;
    if (status === 'published' && exist[0].status === 'draft') {
        published_at = new Date();
    }

    await db.query(
      `UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?, status = ?, published_at = ? WHERE id = ?`,
      [title, slug, content, excerpt, featured_image, status, published_at, req.params.id]
    );

    // Update categories
    await db.query('DELETE FROM post_categories WHERE post_id = ?', [req.params.id]);
    if (category_ids && category_ids.length > 0) {
      const catValues = category_ids.map(cid => [req.params.id, cid]);
      await db.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [catValues]);
    }

    res.json({ message: 'Artikel diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui artikel' });
  }
});

// DELETE /api/blog/posts/:id - Delete post
router.delete('/posts/:id', authMiddleware, requireAdminOrUstad, async (req, res) => {
  try {
     // Check permission
     const [exist] = await db.query('SELECT author_id FROM posts WHERE id = ?', [req.params.id]);
     if (exist.length === 0) return res.status(404).json({ error: 'Artikel tidak ditemukan' });
     if (req.user.role === 'ustad' && exist[0].author_id !== req.user.id) {
         return res.status(403).json({ error: 'Akses ditolak' });
     }

    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Artikel dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus artikel' });
  }
});

// DELETE /api/blog/categories/:id - Delete category
router.delete('/categories/:id', authMiddleware, requireAdminOrUstad, async (req, res) => {
    try {
      await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
      res.json({ message: 'Kategori dihapus' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus kategori' });
    }
});

export default router;
