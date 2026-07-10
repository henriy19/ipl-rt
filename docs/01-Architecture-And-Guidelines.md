# Dokumen Arsitektur & Pedoman Development: Aplikasi Manajemen IPL RT

## 1. Business Flow (Alur Kerja)

### A. Warga (Resident)
1. **Login:** Warga login menggunakan kredensial (misal: Nomor HP/Email dan Password) yang didaftarkan oleh Admin.
2. **Dashboard:** Melihat ringkasan tagihan bulan ini, status pembayaran, dan pengumuman dari RT.
3. **Pengecekan Tagihan:** Melihat rincian tagihan IPL (aktif dan tunggakan).
4. **Pembayaran:** Warga melakukan pembayaran (manual transfer rekening RT).
5. **Konfirmasi Pembayaran:** Mengunggah bukti transfer/pembayaran.
6. **Riwayat:** Melihat riwayat pembayaran yang sudah diverifikasi oleh Admin.

### B. Admin / Pengurus RT
1. **Login:** Admin login dengan akun khusus.
2. **Dashboard:** Melihat statistik keuangan keseluruhan.
3. **Manajemen Pengguna:** Menambah, mengedit, atau menonaktifkan data seluruh pengguna aplikasi (Warga, Petugas, Bendahara, dll).
4. **Manajemen Role & Akses Menu:** Mengatur role baru secara dinamis dan menentukan akses menu/fitur apa saja yang bisa dibuka oleh tiap role (Role-Based Access Control).
5. **Manajemen Iuran (Master):** Menentukan nominal IPL (bisa berbeda berdasarkan tipe rumah jika diperlukan).
6. **Laporan & Rekapitulasi:** Melihat daftar pembayaran warga per bulan (dapat dikelompokkan per RT dan RW) dan mengekspor data tersebut ke format Excel (.xlsx).

### C. Petugas Tagihan
1. **Login:** Petugas login dengan akun khusus.
2. **Dashboard:** Melihat ringkasan tagihan bulan ini dan daftar warga yang menunggak.
3. **Pencatatan Tagihan:** Melakukan *generate* atau pencatatan tagihan ke warga setiap bulannya.
4. **Pencatatan Pembayaran:** Mencatat pembayaran iuran yang dibayarkan warga (misal: pembayaran tunai langsung ke petugas). Pembayaran ini masih membutuhkan verifikasi dari Bendahara.

### D. Bendahara RT
1. **Login:** Bendahara login dengan akun khusus.
2. **Dashboard:** Melihat total kas, dana masuk, dan daftar konfirmasi pembayaran yang perlu diverifikasi.
3. **Verifikasi Pembayaran:** Mengecek mutasi rekening/bukti transfer atau menyocokkan uang tunai yang diserahkan petugas, lalu memverifikasi pembayaran sehingga tagihan menjadi "Lunas".
4. **Laporan Keuangan:** Melihat rekap daftar pembayaran warga per bulan serta melakukan *export* laporan ke Excel.

---

## 2. System Architecture & Folder Structure

### Pendekatan Arsitektur
- **Frontend (Client):** React.js (Vite), Functional Components, Hooks, Tailwind CSS.
- **Backend (Server):** Node.js, Express.js. Menggunakan pola arsitektur Layered (Routes -> Controllers -> Services -> Models).
- **Database:** MySQL.
- **Authentication:** JWT (JSON Web Tokens).

### Struktur Folder Frontend (React)
Menggunakan pendekatan *Feature-based* agar scalable dan mudah dirawat:
```text
frontend/
├── public/
├── src/
│   ├── assets/         # Gambar, ikon, dll
│   ├── components/     # Reusable UI components (Button, Modal, Table, Card, dll)
│   ├── config/         # Konfigurasi env, axios instance setup
│   ├── features/       # Feature-based modules (Logika, UI, State spesifik fitur)
│   │   ├── auth/       # Login, useAuth hook, auth service API
│   │   ├── dashboard/  # Dashboard Admin dan Warga
│   │   ├── warga/      # CRUD Manajemen data warga
│   │   └── tagihan/    # Daftar tagihan & konfirmasi pembayaran
│   ├── hooks/          # Global custom hooks
│   ├── layouts/        # Layout utama (Sidebar, Header, Topbar)
│   ├── routes/         # Definisi routing aplikasi (React Router)
│   ├── utils/          # Fungsi utility (formatRupiah, formatDate, dll)
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

### Struktur Folder Backend (Node.js)
```text
backend/
├── src/
│   ├── config/         # Konfigurasi koneksi DB (MySQL), JWT secret, dll
│   ├── controllers/    # Menangani HTTP requests & responses (hanya req/res parsing)
│   ├── middlewares/    # Middleware (Auth Check, Role Check, Error handling, Upload file)
│   ├── models/         # Representasi struktur/query DB
│   ├── routes/         # Definisi endpoint API dan mapping ke controller
│   ├── services/       # Core Business logic
│   ├── utils/          # Fungsi bantu (hash password, dll)
│   └── app.js          # Konfigurasi Express app
├── .env                # Environment variables
├── server.js           # Entry point (Server runner)
└── package.json
```

---

## 3. Database Schema (ERD) - MySQL

Berikut rancangan struktur tabel utamanya:

### Tabel `users`
Menyimpan data otentikasi dan profil pengguna (Admin, Bendahara, Petugas, dan Warga).
- `id` (VARCHAR(36), PK - UUID)
- `role_id` (VARCHAR(36), FK -> roles.id) - *Menentukan role secara dinamis*
- `nama_lengkap` (VARCHAR)
- `no_hp` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `blok_rumah` (VARCHAR)
- `nomor_rumah` (VARCHAR)
- `status_hunian` (ENUM: 'pemilik', 'penyewa')
- `rt_id` (VARCHAR(36), FK -> master_rt.id) - *Untuk pemetaan wilayah Warga*
- `is_active` (BOOLEAN, default TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

### Tabel `roles`
Menyimpan daftar role secara dinamis.
- `id` (VARCHAR(36), PK - UUID)
- `nama_role` (VARCHAR, misal: 'Admin', 'Bendahara', 'Petugas', 'Warga')
- `created_at`, `updated_at`

### Tabel `menus`
Menyimpan master data menu/fitur sistem (Frontend routing & navigasi).
- `id` (VARCHAR(36), PK - UUID)
- `nama_menu` (VARCHAR, misal: 'Manajemen Warga', 'Laporan Keuangan')
- `path_url` (VARCHAR, misal: '/admin/warga')
- `icon` (VARCHAR)
- `is_active` (BOOLEAN)

### Tabel `role_menus`
Mapping (penengah) akses menu untuk masing-masing role.
- `role_id` (VARCHAR(36), FK -> roles.id)
- `menu_id` (VARCHAR(36), FK -> menus.id)

### Tabel `master_rw`
Menyimpan master data Rukun Warga (RW).
- `id` (VARCHAR(36), PK - UUID)
- `nomor_rw` (VARCHAR, misal: '010')
- `ketua_rw` (VARCHAR, opsional)
- `is_active` (BOOLEAN, default TRUE)
- `created_at`, `updated_at`

### Tabel `master_rt`
Menyimpan master data Rukun Tetangga (RT) yang menginduk ke RW.
- `id` (VARCHAR(36), PK - UUID)
- `rw_id` (VARCHAR(36), FK -> master_rw.id)
- `nomor_rt` (VARCHAR, misal: '001')
- `ketua_rt` (VARCHAR, opsional)
- `is_active` (BOOLEAN, default TRUE)
- `created_at`, `updated_at`

### Tabel `master_iuran`
Menyimpan konfigurasi dasar tagihan IPL.
- `id` (VARCHAR(36), PK - UUID)
- `nama_iuran` (VARCHAR, misal: "IPL Standar 2026")
- `nominal` (DECIMAL)
- `is_active` (BOOLEAN, default TRUE)
- `created_at`, `updated_at`

### Tabel `tagihan`
Data tagihan spesifik untuk masing-masing warga setiap bulannya.
- `id` (VARCHAR(36), PK - UUID)
- `user_id` (VARCHAR(36), FK -> users.id)
- `master_iuran_id` (VARCHAR(36), FK -> master_iuran.id)
- `bulan` (INT, 1-12)
- `tahun` (INT)
- `nominal_tagihan` (DECIMAL)
- `status` (ENUM: 'unpaid', 'pending', 'paid') - *pending = sedang menunggu verifikasi bendahara*
- `created_at`, `updated_at`

### Tabel `transaksi_pembayaran`
Riwayat dan bukti pembayaran untuk setiap tagihan.
- `id` (VARCHAR(36), PK - UUID)
- `tagihan_id` (VARCHAR(36), FK -> tagihan.id)
- `tanggal_bayar` (DATETIME)
- `bukti_pembayaran_url` (VARCHAR)
- `dicatat_oleh` (VARCHAR(36), FK -> users.id, Nullable - ID Petugas jika bayar tunai lewat petugas)
- `diverifikasi_oleh` (VARCHAR(36), FK -> users.id, Nullable - ID Bendahara)
- `tanggal_verifikasi` (DATETIME, Nullable)
- `catatan_bendahara` (TEXT, Nullable - Misal jika pembayaran ditolak)
- `created_at`, `updated_at`

---

## 4. API Contract (RESTful)

### Authentication
- `POST /api/auth/login` : Login user/admin, mengembalikan JWT token, profil dasar, beserta **daftar hak akses menu** (dinamis berdasarkan role).
- `GET /api/auth/me` : Memvalidasi token dan mendapatkan profil user saat ini beserta hak akses.

### Role & Menu Management (RBAC)
- `GET /api/roles` : (Admin) Mendapatkan daftar role.
- `POST /api/roles` : (Admin) Membuat role baru.
- `GET /api/menus` : (Admin) Mendapatkan daftar master menu.
- `POST /api/roles/:id/menus` : (Admin) Mengubah/menyimpan hak akses menu untuk sebuah role.
- `GET /api/roles/:id/menus` : (Admin) Mendapatkan daftar menu untuk role tertentu.

### Users (Semua Role)
- `GET /api/users` : (Admin/Bendahara/Petugas) Mendapatkan daftar pengguna.
- `POST /api/users` : (Admin) Menambahkan pengguna baru.
- `PUT /api/users/:id` : (Admin) Mengupdate data pengguna.
- `DELETE /api/users/:id` : (Admin) Menonaktifkan akun (Soft delete).

### Tagihan
- `GET /api/tagihan` : (Admin/Bendahara/Petugas/Warga) Mendapatkan daftar tagihan. (Jika Warga, hanya tagihannya sendiri).
- `POST /api/tagihan/generate` : (Petugas) Menggenerate tagihan bulan tertentu untuk warga aktif.
- `GET /api/tagihan/:id` : Mendapatkan detail sebuah tagihan.

### Pembayaran
- `POST /api/pembayaran/:tagihan_id` : (Warga/Petugas) Warga submit bukti transfer, atau Petugas mencatat bayar tunai (Status -> 'pending').
- `POST /api/pembayaran/:id/verifikasi` : (Bendahara) Memverifikasi (paid) atau menolak (unpaid) pembayaran yang sudah masuk (transfer/tunai).
- `GET /api/pembayaran/riwayat` : (Semua Role) Mendapatkan riwayat transaksi (Warga hanya melihat riwayat sendiri).

### Dashboard Stats
- `GET /api/dashboard/stats` : (Admin/Bendahara/Petugas) Ringkasan data sesuai role.

### Laporan & Export
- `GET /api/reports/pembayaran` : (Admin/Bendahara) Mendapatkan daftar rekapitulasi pembayaran warga berdasarkan filter (bulan, tahun, rt, rw).
- `GET /api/reports/pembayaran/export` : (Admin/Bendahara) Mengunduh/export rekap laporan pembayaran ke format Excel (.xlsx).
