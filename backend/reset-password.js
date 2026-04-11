import bcrypt from 'bcryptjs';
import db from './db.js';

async function resetPassword() {
  try {
    const email = 'test@example.com';
    const newPassword = 'password123';
    console.log(`Meriset password untuk ${email} menjadi "${newPassword}"...`);
    
    // Hash password baru
    const hash = await bcrypt.hash(newPassword, 10);
    
    // Update ke database
    const [result] = await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);
    
    if (result.affectedRows > 0) {
      console.log('✅ Password berhasil di-reset!');
    } else {
      console.log('❌ Akun tidak ditemukan.');
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan:', err);
  } finally {
    process.exit(0);
  }
}

resetPassword();
