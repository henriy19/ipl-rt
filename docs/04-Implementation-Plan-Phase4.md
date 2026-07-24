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

### 11. Perubahan Nama Dashboard Menjadi Beranda & Penyesuaian Lebar Penuh Halaman (Baru)
- **`frontend/src/layouts/Sidebar.jsx` [MODIFY]**: Mengubah nama menu navigasi dari "Dashboard" menjadi "Beranda".
- **`frontend/src/features/dashboard/Dashboard.jsx` [MODIFY]**: Mengubah judul halaman utama (heading) dari "Dashboard" menjadi "Beranda", serta menghapus batasan lebar maksimal `max-w-7xl mx-auto` agar tampilan halaman Beranda mengisi lebar penuh tanpa ruang kosong di samping kanan-kiri.
### 12. Fitur Filter RT - RW pada Halaman Data Warga (Baru)
- **`frontend/src/features/warga/Warga.jsx` [MODIFY]**: Penambahan dropdown filter RT/RW kustom dengan pencarian di sebelah bar pencarian utama, penyaringan tabel warga secara real-time sesuai RT terpilih, dan pembaruan statistik ringkasan (Total KK, Total Jiwa, Pemilik, Penyewa) secara otomatis.

### 13. Fitur Filter RT pada Halaman Laporan Keuangan (Baru)
- **`backend/src/models/reportModel.js` & `backend/src/controllers/reportController.js` [MODIFY]**: Dukungan parameter `rt_id` pada query SQL laporan rekapitulasi untuk memfilter pemasukan bulanan dan daftar tunggakan per RT.
- **`frontend/src/features/laporan/Laporan.jsx` [MODIFY]**: Penambahan dropdown filter RT pada tab Laporan Keuangan yang secara otomatis meng-update angka Pemasukan Kas Lunas, Total Tunggakan Aktif, Rekap Bulanan, dan Tabel Tagihan per RT.

### 14. Fitur Filter RT pada Halaman Transaksi Iuran (Baru)
- **`backend/src/models/tagihanModel.js` & `backend/src/controllers/tagihanController.js` [MODIFY]**: Penambahan filter `rt_id` pada query `Tagihan.getAll` untuk memfilter daftar tagihan warga per RT.
- **`frontend/src/features/transaksi/Transaksi.jsx` [MODIFY]**: Penambahan dropdown filter RT/RW kustom dengan pencarian pada baris filter transaksi, penyaringan daftar tagihan bulanan secara real-time, dan pembaruan kartu statistik ringkasan (Total Tagihan, Lunas, Belum Lunas) sesuai RT terpilih.

### 15. Fitur Filter RT pada Halaman Master Struktur Organisasi (Baru)
- **`frontend/src/features/master/StrukturOrganisasi.jsx` [MODIFY]**: Penambahan dropdown filter RT/RW kustom dengan pencarian pada baris filter utama, penyaringan daftar pengurus secara real-time, dan pembaruan kartu statistik ringkasan (Total Pengurus, Pengurus Aktif, Warga Belum Masuk Struktur) sesuai RT terpilih.

### 16. Input Tanggal Lahir, No. HP, & Relasi Detail Penghuni pada Data Warga (Baru)
- **`backend/database/init.sql` & `backend/src/config/dbInit.js` [MODIFY]**: Penambahan kolom `tanggal_lahir DATE` pada tabel `users` serta pembuatan tabel relasi `users_penghuni` (`id`, `no_hp`, `no_hp_penghuni`, `nama_lengkap`, `tanggal_lahir`, `created_at`, `updated_at`) dengan foreign key `no_hp` ON DELETE CASCADE ON UPDATE CASCADE.
- **`backend/src/models/penghuniModel.js` [NEW]**: Model pembantu untuk CRUD dan sinkronisasi otomatis anggota keluarga/penghuni rumah (`syncPenghuni`), penanganan kolom `no_hp_penghuni`, kalkulasi otomatis `jumlah_penghuni`, serta sanitasi tanggal lahir (`parseValidDate`).
- **`backend/src/models/userModel.js` & `backend/src/controllers/userController.js` [MODIFY]**: Integrasi proyeksi `tanggal_lahir`, `no_hp_penghuni`, dan pemanggilan `Penghuni.syncPenghuni` pada handler `CreateWarga`, `UpdateWarga`, dan `UploadExcelWarga`.
- **`frontend/src/features/warga/Warga.jsx` [MODIFY]**: Penambahan field input Tanggal Lahir pada Warga Utama, input No. HP opsional per anggota penghuni, sub-form dinamis Detail Penghuni (tambah/hapus anggota keluarga), pembaruan otomatis `jumlah_penghuni`, sanitasi tanggal lahir, serta visualisasi sub-tabel detail penghuni (termasuk kolom No. Handphone) pada Modal Profil Warga.

### 17. Konfigurasi Deployment Railway Multi-Direktori & Migrasi Skema Terisolasi (Baru)
- **`backend/src/config/dbInit.js` & `backend/src/config/db.js` [MODIFY]**: Isolasi eksekusi DDL `ALTER TABLE` secara mandiri per query pada saat server dinyalakan serta penyesuaian konfigurasi SSL fleksibel (`getSslConfig`) untuk koneksi PostgreSQL Railway internal/external.
- **`backend/src/app.js` [MODIFY]**: Penambahan handler file statis `express.static` untuk mendeteksi lokasi bundel `frontend/dist` di berbagai skenario direktori deployment serta pembaruan middleware kompatibilitas Express 5.x untuk *SPA fallback routing*.
- **`server.js`, `start.js`, `backend/start.js`, `frontend/server.js` [NEW]**: Penambahan file entrypoint bridging di root, backend, dan frontend agar perintah `node server.js` selalu berhasil mengeksekusi aplikasi terlepas dari opsi *Root Directory* pada Railway Dashboard (`/`, `/backend`, atau `/frontend`).
- **`Procfile`, `nixpacks.toml`, `railway.json`, `package.json` [NEW/MODIFY]**: Standardisasi perintah *build* (`cd frontend && npm install && npm run build`) dan perintah *start* (`node server.js`), serta sinkronisasi file `package-lock.json` untuk kelancaran eksekusi `npm ci` di Nixpacks Railway.

### 18. Standarisasi Layout, Padding, & Margin Hasil Ekspor PDF (Baru)
- **`frontend/src/features/laporan/Laporan.jsx` [MODIFY]**: Penerapan *internal container padding* (`#print-content { padding: 45px 55px; }`), penyesuaian lebar iframe kanvas (`900px`), penambahan margin luar A4 (`8mm` di jsPDF untuk menghasilkan total margin ~20mm simetris di kedua sisi), perapihan *padding* sel tabel (`th: 12px 14px`, `td: 10px 14px`), pembagian persentase kolom tabel yang presisi, serta penyelarasan desain visual badge status & area tanda tangan di seluruh fungsi ekspor PDF (Data Warga & Keuangan).

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
9. **Dashboard Renaming to Beranda & Layout Verification**:
   - Memastikan menu navigasi paling atas di sidebar menampilkan nama "Beranda".
   - Memastikan saat menu tersebut diklik, judul halaman utama (heading) menampilkan kata "Beranda".
   - Memverifikasi bahwa tata letak halaman Beranda mengisi lebar penuh tanpa ruang kosong di sisi kanan-kiri.
10. **Informasi & Kegiatan Layout Verification**:
    - Menavigasi ke menu "Informasi Kegiatan".
    - Memverifikasi bahwa tata letak halaman Informasi & Kegiatan mengisi lebar penuh tanpa ruang kosong di sisi kanan-kiri.
11. **Filter RT - RW Halaman Data Warga Verification**:
    - Menavigasi ke menu "Data Warga".
    - Mengklik dropdown "RT/RW" di sebelah pencarian dan memilih nomor RT tertentu (misal: "RT 001").
    - Memverifikasi tabel warga dan 4 kartu statistik (Total KK, Total Jiwa, Pemilik, Penyewa) langsung tersaring menyajikan data warga dari RT terpilih.
12. **Filter RT Halaman Laporan Keuangan Verification**:
    - Menavigasi ke menu "Laporan" -> tab "Laporan Keuangan".
    - Mengubah dropdown "Filter RT" dan memilih salah satu RT (misal: "RT 001").
    - Memverifikasi Pemasukan Kas Lunas, Total Tunggakan, Rekap Bulanan, dan Tabel Tagihan langsung tersaring menyajikan data keuangan dari RT terpilih.
13. **Filter RT Halaman Transaksi Iuran Verification**:
    - Menavigasi ke menu "Transaksi".
    - Mengklik dropdown "RT/RW" di baris filter dan memilih nomor RT tertentu (misal: "RT 001").
    - Memverifikasi tabel tagihan dan 3 kartu statistik (Total Tagihan, Lunas, Belum Lunas) langsung tersaring menyajikan tagihan dari RT terpilih.
14. **Filter RT Halaman Master Struktur Organisasi Verification**:
    - Menavigasi ke menu "Master Struktur".
    - Mengklik dropdown "RT/RW" di baris filter dan memilih nomor RT tertentu (misal: "RT 001").
    - Memverifikasi tabel pengurus dan 3 kartu statistik (Total Pengurus, Pengurus Aktif, Warga Belum Masuk Struktur) langsung tersaring menyajikan data dari RT terpilih.
15. **Tanggal Lahir, No. HP, & Detail Penghuni Warga Verification**:
    - Menavigasi ke menu "Data Warga".
    - Mengisi form tambah/edit warga dengan Tanggal Lahir (Warga Utama) dan menambah baris anggota penghuni rumah (Nama Anggota, No. HP opsional, & Tanggal Lahir).
    - Memverifikasi bahwa format tanggal disanitasi secara otomatis (`YYYY-MM-DD`, mencegah format tahun 6-digit `201988`), `no_hp_penghuni` tersimpan dengan benar di PostgreSQL, dan `jumlah_penghuni` dihitung otomatis dari total detail penghuni (warga utama + anggota tambahan) serta tersinkronisasi ke tabel `users_penghuni` dan modal profil warga.
