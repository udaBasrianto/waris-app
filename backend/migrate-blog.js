import db from './db.js';

async function migrate() {
  try {
    console.log("Menambahkan tabel categories...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log("Menambahkan tabel posts...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        content LONGTEXT NOT NULL,
        excerpt TEXT DEFAULT NULL,
        featured_image TEXT DEFAULT NULL,
        author_id VARCHAR(36) NOT NULL,
        status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
        published_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log("Menambahkan tabel post_categories...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS post_categories (
        post_id VARCHAR(36) NOT NULL,
        category_id VARCHAR(36) NOT NULL,
        PRIMARY KEY (post_id, category_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log("✅ Berhasil menambahkan tabel blog ke database!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error migrating:", err);
    process.exit(1);
  }
}

migrate();
