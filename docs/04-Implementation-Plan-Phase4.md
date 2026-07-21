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
- **`backend/src/models/iuranModel.js`**: Query aman ke tabel `master_iuran`.
- **`backend/src/controllers/iuranController.js`**: Fungsi CRUD standar untuk iuran.
- **`backend/src/routes/iuranRoutes.js`**: Router iuran yang aman (membutuhkan JWT).
- **`frontend/src/features/iuran/Iuran.jsx` [NEW]**: Halaman Master Iuran interaktif dengan fitur Tambah, Edit, Hapus, Pencarian, Ringkasan Statistik, serta Pembatasan RBAC agar hanya dapat dimodifikasi oleh Admin/Bendahara/Petugas.

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

### 7. Fitur CRUD & Manajemen Wilayah RT-RW (Baru)
- **`backend/src/models/rwModel.js` [NEW]**: Query PostgreSQL aman untuk CRUD tabel `master_rw` dan verifikasi relasi RT.
- **`backend/src/controllers/rwController.js` [NEW]**: Logic API Rukun Warga (RW) dengan format response `res.success` & `res.error`.
- **`backend/src/routes/rwRoutes.js` [NEW]**: Endpoint `/api/rw` terproteksi token JWT & hak akses pengurus (RBAC).
- **`backend/src/models/rtModel.js` [MODIFY]**: Kueri PostgreSQL untuk CRUD tabel `master_rt`, verifikasi relasi `users`, dan filter `showAll` status aktif.
- **`backend/src/controllers/rtController.js` [MODIFY]**: Logic API Rukun Tetangga (RT), validasi duplikasi nomor RT per RW, dan batasan penghapusan RT jika memiliki warga.
- **`backend/src/routes/rtRoutes.js` [MODIFY]**: Pendaftaran endpoint CRUD RT terproteksi token JWT & RBAC.
- **`backend/src/app.js` [MODIFY]**: Registrasi router `/api/rw`.
- **`frontend/src/layouts/Sidebar.jsx` [MODIFY]**: Penambahan menu "Master RT-RW" (Map icon) pada kelompok Data Master.
- **`frontend/src/App.jsx` [MODIFY]**: Registrasi rute `/rt-rw` dengan layout terproteksi.
- **`frontend/src/features/master/RtRw.jsx` [NEW]**: Halaman manajemen RT-RW berformat tabbed layout (Tab RT & Tab RW) lengkap dengan metrik statistik, filter pencarian, dan modal interaktif CRUD.

### 8. Fitur CRUD & Manajemen Struktur Organisasi (Baru)
- **`backend/src/models/strukturModel.js` [NEW]**: Query PostgreSQL aman untuk CRUD tabel `master_struktur` dengan join ke `users` (profil warga), `roles` (jabatan/peran), dan `master_rt`/`master_rw`.
- **`backend/src/controllers/strukturController.js` [NEW]**: Logic API Struktur Organisasi, validasi penunjukan warga dari dropdownlist, validasi jabatan berdasarkan role_id, penentuan RT penugasan (rt_id), dan pencegahan duplikasi pendaftaran satu warga menjadi pengurus ganda.
- **`backend/src/routes/strukturRoutes.js` [NEW]**: Endpoint `/api/struktur` terproteksi JWT & hak akses pengurus (RBAC).
- **`backend/src/app.js` [MODIFY]**: Registrasi router `/api/struktur`.
- **`frontend/src/layouts/Sidebar.jsx` [MODIFY]**: Penambahan menu "Master Struktur" (Contact icon) pada kelompok Data Master.
- **`frontend/src/App.jsx` [MODIFY]**: Registrasi rute `/struktur`.
- **`frontend/src/features/master/StrukturOrganisasi.jsx` [NEW]**: Halaman manajemen Struktur Organisasi berisi visualisasi tabel kepengurusan, metrik ringkasan pengurus aktif, dan modal CRUD dengan dropdown input dinamis bersumber dari data warga, data role (jabatan), dan data RT-RW.

### 9. Fitur Upload & Upsert Data Warga via Excel (Baru)
- **`backend/src/routes/userRoutes.js` [MODIFY]**: Pendaftaran endpoint `POST /api/users/upload-excel` terproteksi JWT.
- **`backend/src/controllers/userController.js` [MODIFY]**: Implementasi controller `UploadExcelWarga` untuk memecah Base64 file excel, memparsing dengan library `xlsx`, melakukan pencocokan relasi RT/RW dan Role, serta melakukan upsert dengan `ON CONFLICT (no_hp) DO UPDATE SET...` di database.
- **`frontend/src/features/warga/Warga.jsx` [MODIFY]**: Penambahan tombol "Download Template" dan "Upload Excel" di header serta modal dialog form upload, pembacaan file dengan `FileReader` ke Base64, pengiriman ke backend, dan pembaruan visual tabel secara real-time.

### 10. Fitur Laporan Data Warga dengan Filter RT (Baru)
- **`frontend/src/features/laporan/Laporan.jsx` [MODIFY]**:
  - Penambahan antarmuka tab (Tab Laporan Keuangan & Tab Laporan Data Warga).
  - Pemuatan data warga (`/api/users`) dan RT (`/api/rt`) secara dinamis di halaman Laporan.
  - Implementasi dropdown filter RT kustom untuk menyaring daftar warga yang ditampilkan.
  - Penyajian ringkasan statistik (Total KK, Total Jiwa, Hunian Pemilik/Penyewa) sesuai RT yang dipilih.
  - Penambahan tombol "Ekspor PDF Data Warga" yang secara langsung mengunduh/menyimpan berkas PDF daftar warga terpilih dengan kop surat dan layout tabel bersih (tanpa memicu dialog cetak printer).

---

## Verification Plan

1. **Dropdown Reference Fetching Verification**:
   - Memastikan dropdown RT/RW and Roles di Form Tambah/Edit memuat data yang benar secara dinamis.
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
5. **RT-RW CRUD Management Verification**:
   - Memverifikasi penambahan data RW & RT baru dari halaman Master RT-RW.
   - Memverifikasi pencegahan duplikasi nomor RT pada RW yang sama.
   - Memverifikasi integrasi validasi relasi asing: Penolakan hapus RW jika masih memiliki RT, dan penolakan hapus RT jika masih memiliki warga.
   - Memverifikasi bahwa data RT/RW yang baru dibuat langsung tersinkronisasi di dropdown pendaftaran Data Warga.
6. **Struktur Organisasi CRUD Verification**:
   - Memverifikasi pemuatan dropdown warga aktif, dropdown peran/jabatan (role), dan dropdown RT penugasan secara dinamis saat tambah pengurus baru.
   - Memverifikasi penyimpanan data struktur organisasi (UUID, user_id, role_id, rt_id, status) ke database PostgreSQL.
   - Memverifikasi pencegahan penunjukan satu warga sebagai pengurus lebih dari satu kali.
   - Memverifikasi aksi ubah jabatan (role), RT penugasan, dan status keaktifan pengurus.
   - Memastikan pembatasan RBAC agar hanya peran pengurus yang dapat memodifikasi data.
7. **Excel Bulk Upload & Upsert Verification**:
   - Menyiapkan berkas excel berisi data warga lama (yang akan di-update) dan data warga baru (yang akan di-insert).
   - Mengunggah berkas tersebut via UI Admin, memverifikasi status response dari backend.
   - Memastikan data warga ter-upsert dengan benar di database dan ter-render di tabel frontend secara real-time.
8. **Citizen Data Report & RT Filter Verification**:
   - Menavigasi ke menu "Laporan" -> klik tab "Laporan Data Warga".
   - Mengubah filter dropdown RT dan memastikan tabel warga serta metrik statistik (Total KK, Total Jiwa) ter-update secara real-time.
   - Mengklik tombol "Ekspor PDF Data Warga" dan memverifikasi layout PDF Kop Surat laporan warga terunduh dengan benar.
