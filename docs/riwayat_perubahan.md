# Riwayat Perubahan Aplikasi Konsultasi Faraidh

Dokumen ini mencatat seluruh perubahan besar yang telah dilakukan pada aplikasi untuk meningkatkan fitur dan fleksibilitas infrastruktur.

---

## 1. Penambahan Fitur Kalkulator Faraidh
Fitur ini ditambahkan sebagai alat simulasi pembagian warisan publik untuk menarik minat pengguna.
- **[NEW]** `src/pages/Kalkulator.tsx`: Implementasi logika perhitungan waris (Suami/Istri, Ayah, Ibu, Anak Lk, Anak Pr) dengan visualisasi **Pie Chart** menggunakan library `recharts`.
- **[MODIFY]** `src/App.tsx`: Pendaftaraan rute `/kalkulator`.
- **[MODIFY]** `src/pages/Index.tsx`: Penambahan link ke Kalkulator pada kartu layanan.

## 2. Migrasi Infrastruktur (Supabase ke MySQL + Node.js)
Perubahan paling signifikan adalah pelepasan ketergantungan dari Supabase (BaaS) dan beralih ke Backend mandiri.

### A. Backend Development (Node.js + Express)
Membuat sistem backend baru di folder `backend/`:
- **Server**: Menggunakan **Express.js** untuk menangani REST API.
- **Database**: Menggunakan **MySQL 8.0** (Laragon) menggantikan PostgreSQL Supabase.
- **Auth**: Implementasi **JWT (JSON Web Token)** manual untuk sistem login yang aman.
- **Middleware**: Sistem proteksi route (`authMiddleware`) dan pembatasan akses (`adminOnly`, `ustadOrAdmin`).

### B. Skema Database MySQL
Membuat database `konsultasi_faraidh` dengan 9 tabel:
1. `users`: Data autentikasi.
2. `profiles`: Data profil pengguna (nama, telepon, avatar).
3. `user_roles`: Manajemen role (admin, ustad, klien).
4. `ustad_profiles`: Detail profesional ustad.
5. `ustad_availability`: Jadwal ketersediaan mingguan.
6. `consultations`: Data sesi konsultasi.
7. `messages`: Riwayat chat dalam konsultasi.
8. `ratings`: Penilaian ustad oleh klien.
9. `consultation_bookings`: Jadwal booking konsultasi.

### C. Refactoring Frontend (React)
Mengubah cara frontend berkomunikasi dengan backend:
- **[NEW]** `src/lib/api.ts`: Pembuatan HTTP client berbasis `fetch` untuk mempermudah pemanggilan API dengan header JWT otomatis.
- **[MODIFY]** `src/contexts/AuthContext.tsx`: Mengubah manajemen session dari Supabase Auth menjadi JWT localStorage.
- **[MODIFY] Semua Halaman**: Seluruh pemanggilan `supabase.from(...)` di file berikut telah diganti dengan `api.get/post/put/delete`:
  - `Index.tsx`, `Konsultasi.tsx`, `ChatRoom.tsx`, `Riwayat.tsx`.
  - `AdminDashboard.tsx`, `UstadDashboard.tsx`, `UstadProfil.tsx`.
  - `PengaturanAkun.tsx`, `KeamananPrivasi.tsx`.
  - `UstadScheduleManager.tsx`.
- **[MODIFY] Real-time ke Polling**: Fitur chat dan notifikasi yang sebelumnya menggunakan WebSocket Supabase diganti dengan sistem **polling** (fetch setiap 3-10 detik) untuk kemudahan implementasi awal di Node.js.

### D. Konfigurasi Lingkungan
- **[MODIFY]** `.env`: Menghapus config Supabase dan menambahkan `VITE_API_URL=http://localhost:3001/api`.
- **[MODIFY]** `src/components/ProtectedRoute.tsx`: Penyesuaian pengecekan akses login berdasarkan state user baru.

---
**Status Terakhir**: Migrasi selesai, aplikasi berjalan full di MySQL lokal, 0 error TypeScript.

---

## 3. Pembersihan Sisa-sisa Supabase & Lovable
Menghapus seluruh folder, file konfigurasi, dan dependency yang tidak lagi digunakan setelah migrasi ke MySQL.

### Yang Dihapus:
- **[DELETE]** Folder `.lovable/` — Konfigurasi dan plan Lovable.
- **[DELETE]** Folder `supabase/` — Konfigurasi (`config.toml`) dan 7 file migrasi SQL Supabase.
- **[DELETE]** Folder `src/integrations/supabase/` — Client dan types Supabase lama (`client.ts`, `types.ts`).
- **[MODIFY]** `package.json` — Menghapus dependency `@supabase/supabase-js` dan devDependency `lovable-tagger`.
- **[MODIFY]** `vite.config.ts` — Menghapus import dan penggunaan plugin `componentTagger` dari `lovable-tagger`.

### Hasil:
- 12 package NPM dihapus dari `node_modules`.
- Proyek sepenuhnya bersih dari ketergantungan Supabase dan Lovable.

