# Rencana Implementasi: Fase 4 (API & UI Autentikasi, CRUD Master Data & Data Warga)

Fase ini mencakup implementasi sistem keamanan autentikasi JWT serta pembangunan endpoint CRUD (Create, Read, Update, Delete) yang aman terhadap SQL Injection untuk mengelola data warga (`users`) dan master iuran (`master_iuran`), dilengkapi dengan standardisasi response API dan visualisasi tabel warga di Frontend.

---

## Proposed Changes

### 1. Sistem Keamanan & Autentikasi (Selesai)
- **`src/controllers/authController.js` & `authRoutes.js`**: Endpoint `POST /api/auth/login` untuk menerbitkan token JWT.
- **`src/middlewares/authMiddleware.js`**: Proteksi rute menggunakan token JWT.
- **`src/context/AuthContext.jsx` & `src/App.jsx`**: State global autentikasi dan routing proteksi halaman.

### 2. Standardisasi Response & Error Handler (Selesai)
- **`src/middlewares/errorMiddleware.js`**:
  - Global error handler untuk menangani Server Error (500) agar server tidak crash dan mengembalikan format JSON yang rapi.
- **Format Response Standar**:
  - Sukses: `{ "status": "success", "message": "...", "data": [...] }`
  - Gagal: `{ "status": "error", "message": "..." }`

### 3. Modul Warga / Users CRUD & Referensi Pendukung (Baru)
- **`src/models/userModel.js`**:
  - Mengambil/menyimpan data warga secara aman dengan *Prepared Statements* (`?` binding).
  - Melakukan join ke tabel `roles` dan `master_rt`/`master_rw` untuk mendapatkan informasi wilayah lengkap.
- **`src/controllers/userController.js`**:
  - `GetAllWarga`, `GetWargaById`, `CreateWarga`, `UpdateWarga`, `DeleteWarga`.
  - Otomatis membuat UUID menggunakan `crypto.randomUUID()`.
  - Meng-hash password default (`password123`) menggunakan `bcryptjs` jika penambahan warga baru tidak menyertakan password.
- **`src/routes/userRoutes.js`**:
  - Router untuk operasi CRUD warga dengan pengamanan via `authMiddleware`.
- **`src/models/rtModel.js` & `src/controllers/rtController.js` & `src/routes/rtRoutes.js` [NEW]**:
  - Endpoint `GET /api/rt` untuk mengambil daftar RT/RW secara dinamis dari database untuk digunakan pada dropdown form.
- **`src/models/roleModel.js` & `src/controllers/roleController.js` & `src/routes/roleRoutes.js` [NEW]**:
  - Endpoint `GET /api/roles` untuk mengambil daftar Peran (Roles) untuk pilihan dropdown form.

### 4. Modul Master Iuran CRUD (Selesai)
- **`src/models/iuranModel.js`**: Query aman ke tabel `master_iuran`.
- **`src/controllers/iuranController.js`**: Fungsi CRUD standar untuk iuran.
- **`src/routes/iuranRoutes.js`**: Router iuran yang aman (membutuhkan JWT).

### 5. Integrasi UI & Fitur Interaktif CRUD Warga (Baru)
- **`src/services/api.js`**: Axios instance sentral dengan baseURL dan interceptor token.
- **`src/features/warga/Warga.jsx`**:
  - Implementasi aksi **Tambah Warga**: Membuka modal form pengisian dengan pilihan RT/RW dan Peran yang diambil secara dinamis dari API, lalu melakukan request `POST /api/users`.
  - Implementasi aksi **Edit Warga**: Membuka modal form terpopulasi dengan data warga terpilih, lalu melakukan request `PUT /api/users/:id`.
  - Implementasi aksi **View Warga**: Membuka modal detail info warga (Blok, No Rumah, RT/RW, Peran, Status Hunian, Tanggal Pendaftaran).
  - Implementasi aksi **Hapus Warga**: Membuka modal konfirmasi hapus warga, lalu melakukan request `DELETE /api/users/:id`.

### 6. Fitur Manajemen Informasi & Kegiatan (Baru)
- **`backend/database/migration_informasi.sql` [NEW]**: Membuat tabel `informasi` untuk menyimpan data kegiatan/event.
- **`backend/src/models/informasiModel.js` [NEW]**: Kueri aman ke tabel `informasi` (termasuk fetch 5 kegiatan terbaru).
- **`backend/src/controllers/informasiController.js` [NEW]**: Fungsionalitas CRUD standard & controller API untuk informasi. Mendukung penyimpanan media file upload (Base64 decode ke file fisik di folder `public/uploads`) serta penyimpanan link URL eksternal secara fleksibel.
- **`backend/src/routes/informasiRoutes.js` [NEW]**: Rute API `/api/informasi` terproteksi JWT token dan batasan RBAC.
- **`frontend/src/features/informasi/Informasi.jsx` [NEW]**: Halaman utama informasi kegiatan warga beserta modal CRUD form dengan pilihan upload file atau input tipe link URL untuk foto dan video.
- **`frontend/src/features/dashboard/Dashboard.jsx` [MODIFY]**: Integrasi widget 5 Kegiatan RT-RW Terkini lengkap dengan detail modal.
- **`frontend/src/layouts/Sidebar.jsx` [MODIFY]**: Penambahan menu "Informasi Kegiatan" (Megaphone icon).

---

## Verification Plan

1. **Dropdown Reference Fetching Verification**:
   - Memastikan dropdown RT/RW dan Roles di Form Tambah/Edit memuat data yang benar secara dinamis.
2. **Form Validation & POST/PUT Testing**:
   - Memastikan input data warga divalidasi dengan baik (Nama & HP wajib diisi).
   - Memastikan data warga baru terdaftar dengan benar di database setelah submit.
   - Memastikan pembaruan data warga tersimpan secara instan di database.
3. **Delete Confirmation & Execution**:
   - Memverifikasi modal konfirmasi saat menghapus dan memastikan data terhapus bersih dari database.
4. **Information Management Verification**:
   - Memverifikasi pembuatan data informasi kegiatan baru oleh Admin menggunakan opsi **file upload** (menyimpan file di backend disk) maupun opsi **link URL**.
   - Memverifikasi pembaruan data dan penghapusan informasi kegiatan secara real-time.
   - Memastikan modal detail dapat menampilkan gambar dan memutar video secara dinamis (Youtube/MP4).
   - Memastikan warga biasa tidak dapat melakukan aksi tulis/CRUD (RBAC) pada data informasi.
