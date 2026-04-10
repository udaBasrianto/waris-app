# Panduan Deploy ke aaPanel (konsultasifaraidh.com)

## Arsitektur Aplikasi
```
konsultasifaraidh.com (Nginx)
├── / → Frontend (file statis dari dist/)
└── /api → Reverse Proxy ke Node.js backend (port 3001)
```

---

## Langkah 1: Persiapan Server di aaPanel

### A. Install Software yang Dibutuhkan
Pastikan sudah terinstall di aaPanel:
- **Nginx** (Web Server)
- **MySQL 8.0** (Database)
- **Node.js** (versi 18+ via App Store aaPanel → Node.js Version Manager)

### B. Buat Website di aaPanel
1. Buka **Website → Add site**
2. Domain: `konsultasifaraidh.com`
3. PHP: pilih **Pure Static** (kita tidak pakai PHP)
4. Catat path root website, biasanya: `/www/wwwroot/konsultasifaraidh.com`

### C. Buat Database MySQL
1. Buka **Database → Add database**
2. Nama database: `konsultasi_faraidh`
3. Username: `konsultasi_faraidh` (atau sesuai keinginan)
4. Password: *catat password-nya*
5. Akses: **Local server**

---

## Langkah 2: Clone Repository dari GitHub

SSH ke server, lalu:
```bash
cd /www/wwwroot/konsultasifaraidh.com
git clone https://github.com/udaBasrianto/waris-app.git .
```

> **Catatan**: Titik (`.`) di akhir supaya clone langsung ke folder saat ini, bukan subfolder.

---

## Langkah 3: Setup Backend

### A. Install Dependencies
```bash
cd /www/wwwroot/konsultasifaraidh.com/backend
npm install
```

### B. Buat File Environment
```bash
cp .env.example .env
nano .env
```

Isi dengan konfigurasi production:
```env
DB_HOST=localhost
DB_USER=konsultasi_faraidh
DB_PASSWORD=password_database_anda
DB_NAME=konsultasi_faraidh
JWT_SECRET=ganti_dengan_string_random_panjang_minimal_32_karakter
PORT=3001
```

> **Tips**: Generate JWT_SECRET dengan: `openssl rand -hex 32`

### C. Import Skema Database
```bash
mysql -u konsultasi_faraidh -p konsultasi_faraidh < schema.sql
```

### D. Jalankan Backend dengan PM2
```bash
# Install PM2 (global)
npm install -g pm2

# Jalankan backend
cd /www/wwwroot/konsultasifaraidh.com/backend
pm2 start server.js --name "faraidh-api"

# Auto-start saat server reboot
pm2 save
pm2 startup
```

Verifikasi backend jalan:
```bash
curl http://localhost:3001/api/health
# Harus return: {"status":"ok"}
```

---

## Langkah 4: Build Frontend

```bash
cd /www/wwwroot/konsultasifaraidh.com
npm install
npm run build
```

Ini akan menghasilkan folder `dist/` berisi file statis yang siap di-serve oleh Nginx.

---

## Langkah 5: Konfigurasi Nginx di aaPanel

Buka **Website → konsultasifaraidh.com → Config** (ikon Setting), lalu edit konfigurasi Nginx.

Ganti isi konfigurasi `server` block menjadi:

```nginx
server {
    listen 80;
    server_name konsultasifaraidh.com www.konsultasifaraidh.com;

    # Root mengarah ke hasil build frontend
    root /www/wwwroot/konsultasifaraidh.com/dist;
    index index.html;

    # Frontend - SPA (Single Page Application) routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Reverse Proxy ke Node.js
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Caching untuk file statis
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Log
    access_log /www/wwwlogs/konsultasifaraidh.com.log;
    error_log /www/wwwlogs/konsultasifaraidh.com.error.log;
}
```

**Setelah edit**, klik **Save** dan Nginx akan otomatis reload.

---

## Langkah 6: Setup SSL (HTTPS)

1. Di aaPanel, buka **Website → konsultasifaraidh.com → SSL**
2. Pilih **Let's Encrypt**
3. Centang domain `konsultasifaraidh.com` dan `www.konsultasifaraidh.com`
4. Klik **Apply**
5. Aktifkan **Force HTTPS**

---

## Langkah 7: Verifikasi

Buka browser dan akses:
- `https://konsultasifaraidh.com` → Halaman utama tampil
- `https://konsultasifaraidh.com/api/health` → `{"status":"ok"}`

---

## Update Aplikasi (Deploy Ulang)

Setiap kali ada perubahan kode, jalankan di server:
```bash
cd /www/wwwroot/konsultasifaraidh.com

# Tarik perubahan terbaru
git pull origin main

# Rebuild frontend
npm install
npm run build

# Restart backend (jika ada perubahan backend)
cd backend
npm install
pm2 restart faraidh-api
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Halaman blank/404 | Cek `root` di Nginx mengarah ke `/dist`, pastikan `try_files` ada |
| API error 502 | Backend belum jalan, cek `pm2 status` dan `pm2 logs faraidh-api` |
| CORS error | Sudah ditangani di `server.js` (`cors({ origin: '*' })`) |
| Database error | Cek `.env` di folder `backend/`, pastikan credential benar |
