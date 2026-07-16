# Walkthrough: Fase 4 (Autentikasi, CRUD Backend & UI Interaktif Data Warga)

Seluruh komponen pada Fase 4 (Autentikasi, CRUD Backend untuk Warga/Iuran/RT/Roles, Standardisasi Response, dan Halaman Data Warga Interaktif di Frontend) telah berhasil diimplementasikan, diintegrasikan, dan diverifikasi.

---

## Modul & Fitur yang Diimplementasikan

### 1. Keamanan & Autentikasi JWT (Selesai)
- Sistem login terproteksi dengan enkripsi password `bcrypt` dan penerbitan token JWT.
- Navigasi Frontend dilindungi oleh `ProtectedRoute.jsx` dan axios request/response interceptor terintegrasi di `services/api.js`.

### 2. Standardisasi & Middleware (Selesai)
- **`backend/src/middlewares/errorMiddleware.js`**:
  - `responseFormatter`: Menambahkan helper `res.success` dan `res.error` untuk menyamakan format keluaran JSON API.
  - `errorHandler`: Menangkap internal error 500 secara global dan aman.

### 3. Modul CRUD Warga & API Referensi Pendukung (Baru)
- **`backend/src/models/userModel.js`**: Melakukan query data dengan join ke tabel `roles` dan `master_rt`/`master_rw` serta menggunakan *Prepared Statements* (`?`) untuk mencegah SQL Injection.
- **`backend/src/controllers/userController.js`**:
  - `GetAllWarga`, `GetWargaById`, `CreateWarga`, `UpdateWarga`, `DeleteWarga`.
  - Otomatis men-generate UUID acak menggunakan `crypto.randomUUID()`.
  - Otomatis meng-hash password default (`password123`) jika tidak ditentukan oleh admin.
- **`backend/src/routes/userRoutes.js`**: Mendaftarkan rute CRUD warga yang dilindungi JWT.
- **`backend/src/models/rtModel.js` & `controllers/rtController.js` & `routes/rtRoutes.js` [NEW]**:
  - Menyediakan endpoint `GET /api/rt` untuk mengambil data RT/RW secara dinamis dari database.
- **`backend/src/models/roleModel.js` & `controllers/roleController.js` & `routes/roleRoutes.js` [NEW]**:
  - Menyediakan endpoint `GET /api/roles` untuk mengambil data Peran secara dinamis dari database.

### 4. Modul CRUD Master Iuran (Selesai)
- **`backend/src/models/iuranModel.js`** & **`iuranController.js`** & **`iuranRoutes.js`**:
  - Fungsionalitas CRUD lengkap dan aman untuk iuran bulanan (`master_iuran`).
- **`frontend/src/features/iuran/Iuran.jsx` [NEW]**:
  - Implementasi halaman utama Master Iuran yang menyajikan data iuran bulanan dalam bentuk tabel premium.
  - **Aksi Tambah Iuran**: Modal form input untuk mendaftarkan jenis iuran baru (Nama & Nominal).
  - **Aksi Edit Iuran**: Modal form untuk memperbarui data iuran terpilih.
  - **Aksi Hapus Iuran**: Modal konfirmasi sebelum menghapus iuran agar tidak mengganggu transaksi warga.
  - **Ringkasan Statistik**: Menampilkan metrik Total Jenis Iuran, Iuran Aktif, dan Iuran Nonaktif secara dinamis di atas tabel.
  - **Keamanan RBAC**: Membatasi tombol aksi tulis (Tambah/Edit/Hapus) agar hanya muncul untuk peran Admin, Bendahara, dan Petugas. Pengguna dengan peran Warga biasa hanya memiliki akses baca (read-only) tanpa tombol aksi.

### 5. Integrasi UI & Fitur Interaktif CRUD Warga (Baru)
- **`frontend/src/features/warga/Warga.jsx`**:
  - Halaman **Data Warga** yang sepenuhnya terhubung dengan API `GET /api/users`.
  - **Aksi Tambah Warga**: Membuka modal form dinamis dengan dropdown RT/RW dan Peran yang di-load dari API referensi, serta radio button untuk Status Hunian (Pemilik/Penyewa).
  - **Aksi Edit Warga**: Membuka modal dengan form ter-prepopulate sesuai data warga terpilih untuk diperbarui.
  - **Aksi View Warga**: Modal detail profil untuk melihat informasi warga secara mendalam (termasuk tanggal bergabung).
  - **Aksi Hapus Warga**: Modal konfirmasi keamanan sebelum menghapus data warga secara permanen.
  - Tampilan menggunakan warna *Soft Emerald Green* yang elegan, responsif, dan rapi sesuai estetika Wargatify.

#### 6. Fitur Informasi & Kegiatan RT-RW (Baru)
- **[init.sql](file:///c:/Nitip/hf/lab%20training/ipl-rt/backend/database/init.sql) [MODIFY]**: Mengintegrasikan DDL pembuatan tabel `informasi` (dengan field `id` (UUID), `judul`, `narasi`, `tanggal`, `kategori`, `foto_url`, `video_url`) dan 5 seed data awal langsung ke dalam skrip inisialisasi database utama agar memudahkan deployment di lingkungan baru secara sekali jalan.
- **[informasiModel.js](file:///c:/Nitip/hf/lab%20training/ipl-rt/backend/src/models/informasiModel.js) [NEW]**: Kueri database aman untuk mengambil semua data (terbaru), 5 data terakhir (untuk dashboard), kueri spesifik ID, pembuatan data, pembaruan data, dan penghapusan data.
- **[informasiController.js](file:///c:/Nitip/hf/lab%20training/ipl-rt/backend/src/controllers/informasiController.js) [NEW]**: Kontroler Express dengan logika validasi, pembuatan UUID acak (`crypto.randomUUID()`), standardisasi response API (`res.success` & `res.error`), error handling terintegrasi, dan decoder Base64 untuk menyimpan file secara fisik ke folder disk `public/uploads` jika diunggah dari client.
- **[informasiRoutes.js](file:///c:/Nitip/hf/lab%20training/ipl-rt/backend/src/routes/informasiRoutes.js) [NEW]**: Rute API `/api/informasi` terproteksi JWT token. Menerapkan RBAC modular di mana aksi menulis (POST, PUT, DELETE) hanya diperuntukkan bagi peran **Admin**, **Petugas**, dan **Bendahara**.
- **[app.js](file:///c:/Nitip/hf/lab%20training/ipl-rt/backend/src/app.js) [MODIFY]**: Mendaftarkan router `informasiRoutes` secara global di `/api/informasi`, menyetel kapasitas limit parsing body ke `50mb` (agar data Base64 media berukuran besar tidak terhambat), dan mengekspos direktori static `/uploads`.
- **[App.jsx](file:///c:/Nitip/hf/lab%20training/ipl-rt/frontend/src/App.jsx) [MODIFY]**: Menambahkan rute `<Route path="informasi" element={<Informasi />} />` di bawah rute terproteksi.
- **[Sidebar.jsx](file:///c:/Nitip/hf/lab%20training/ipl-rt/frontend/src/layouts/Sidebar.jsx) [MODIFY]**: Menambahkan menu **Informasi Kegiatan** ke dalam menu utama navigasi sidebar menggunakan ikon `Megaphone` serta menyematkan footer informasi versi `Wargatify Version 1.0.0` dan teks `Powered by ASBAK` pada bagian bawah sidebar.
- **[Informasi.jsx](file:///c:/Nitip/hf/lab%20training/ipl-rt/frontend/src/features/informasi/Informasi.jsx) [NEW]**: 
  - Menyajikan daftar seluruh informasi kegiatan dalam bentuk grid kartu modern.
  - Membatasi visibilitas tombol CRUD (Tambah, Edit, Hapus) agar hanya dapat diakses oleh peran pengurus/admin.
  - Form input Tambah/Edit dilengkapi dengan **Pilihan Upload File** (membaca file sebagai Base64) atau **Input Link URL** untuk foto dan video secara fleksibel.
  - Dilengkapi **Live Preview** interaktif untuk memperlihatkan rendering foto dan pemutar video secara langsung sebelum data disimpan.
  - Modal detail kegiatan menampilkan foto besar dan pemutar video yang terintegrasi (mendukung tautan direct MP4 dan embed video YouTube secara responsif).
- **[Dashboard.jsx](file:///c:/Nitip/hf/lab%20training/ipl-rt/frontend/src/features/dashboard/Dashboard.jsx) [MODIFY]**: Menampilkan widget **Kegiatan RT-RW Terkini** di bagian kanan dashboard yang menampilkan 5 kegiatan terbaru. Pengguna dapat mengeklik kartu kegiatan untuk membuka modal detail kegiatan langsung dari dashboard.

---

## Verifikasi & Hasil Pengujian UI di Browser

### A. Alur CRUD Data Warga
Verifikasi visual dilakukan dengan browser agent untuk seluruh alur CRUD warga:
1. **Login Sukses**: Admin login dengan kredensial `081100000001` / `password123`. Subtitle pada halaman login telah disesuaikan menjadi "Manajemen Warga Jadi Lebih Mudah".
2. **Tambah Warga**: Menambahkan warga baru "Candra Warga" (081199990001, Blok C No. 8, Status: Penyewa, RT: 001/RW 010). Data berhasil disimpan ke MySQL dan muncul instan di tabel warga.
3. **View Detail**: Menampilkan modal detail profil Candra Warga secara presisi.
4. **Edit Warga**: Mengubah blok rumah Candra Warga menjadi "Blok D". Data langsung ter-update di tabel.
5. **Hapus Warga**: Menghapus Candra Warga melalui modal konfirmasi. Data terhapus bersih dan visual tabel kembali ke 3 data semula (Budi, Agus, Siti).

#### Rekaman Demo Validasi CRUD Warga
Sistem mencatat seluruh jalannya verifikasi CRUD interaktif warga:
- File Rekaman: ![warga_crud_operations](file:///C:/Users/IDX-203/.gemini/antigravity/brain/2dadcf10-dd37-4905-8a13-4d1dedc4bea1/warga_crud_operations_1783418815302.webp)

### B. Alur CRUD Informasi & Kegiatan RT-RW (Upload & Link)
Verifikasi visual dilakukan dengan browser agent untuk alur Informasi & Kegiatan:
1. **Uji CRUD & Unggah File Media**: Admin login, menavigasi ke menu "Informasi Kegiatan", menambahkan event baru "Lomba Masak PKK" dengan **mengunggah file foto/video secara langsung** (serta menguji pemuatan link URL eksternal). Media terunggah tersimpan aman di disk server backend dan berhasil di-render di detail modal.
2. **Uji RBAC Warga**: Warga login, menavigasi ke menu "Informasi Kegiatan", dan memverifikasi bahwa tombol "Tambah Informasi" serta aksi edit/delete tersembunyi secara sempurna.

#### Rekaman Demo & Hasil Pengujian Fitur Informasi
- Rekaman Demo Fitur Media Upload & CRUD:
  ![Admin Media Upload & CRUD Flow](file:///C:/Users/IDX-203/.gemini/antigravity-ide/brain/7af133e6-e95a-4aa4-ac6e-fb781a4a3080/verify_media_upload_flow_-62135596800000.webp)
- Rekaman Demo RBAC Warga:
  ![Warga Permissions Flow](file:///C:/Users/IDX-203/.gemini/antigravity-ide/brain/7af133e6-e95a-4aa4-ac6e-fb781a4a3080/verify_warga_role_permissions_1783574718751.webp)
- Screenshot Halaman Informasi Warga:
  ![Warga View Screenshot](file:///C:/Users/IDX-203/.gemini/antigravity-ide/brain/7af133e6-e95a-4aa4-ac6e-fb781a4a3080/warga_informasi_view_1783574750407.png)

### C. Alur CRUD Master RT-RW (Rukun Tetangga & Rukun Warga)
Verifikasi visual dan integrasi data telah diuji menggunakan browser agent otomatis untuk alur manajemen wilayah:
1. **Tambah Rukun Warga (RW)**: Admin menavigasi ke menu "Master RT-RW" -> tab "Daftar Rukun Warga (RW)" -> menambahkan RW baru "015" dengan ketua "Budi RW 015". Data tersimpan sukses ke PostgreSQL.
2. **Tambah Rukun Tetangga (RT)**: Menavigasi ke tab "Daftar Rukun Tetangga (RT)" -> menambahkan RT baru "009" menautkan ke RW penaung "015" dengan ketua "Agus RT 009". Data tersimpan sukses.
3. **Edit & View RT**: Mengubah ketua RT 009 menjadi "Agus RT 009 Edited", data langsung ter-update di tabel dan modal view memuat info yang benar.
4. **Validasi Hapus RT & RW**: Menghapus RT 009 sukses. Menghapus RW 015 sukses. Sistem juga menolak penghapusan RT jika masih dihuni warga, dan menolak penghapusan RW jika masih menaungi RT.

#### Rekaman Demo & Hasil Pengujian Fitur RT-RW
- Rekaman Demo RT-RW CRUD Flow:
  ![verify_rtrw_crud_flow](file:///C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_rtrw_crud_flow_1784105687379.webp)

### D. Alur CRUD Master Struktur Organisasi (Manajemen Struktur Pengurus)
Verifikasi visual dan relasi data telah diuji menggunakan browser agent otomatis untuk alur manajemen struktur organisasi:
1. **Tambah Pengurus**: Admin menavigasi ke menu "Master Struktur" -> klik "Tambah Pengurus" -> memilih warga dari dropdown kustom -> memilih jabatan dari DDL Role (misal: Bendahara) -> memilih RT penugasan dari DDL RT (misal: RT 001) -> klik Simpan. Pengurus tersimpan sukses di database.
2. **Edit & View Pengurus**: Mengubah jabatan (role) dan RT penugasan pengurus, lalu memverifikasi data ter-update secara instan pada tabel dan detail modal.
3. **Duplikasi Check**: Mencoba mendaftarkan warga yang sama kembali sebagai pengurus, sistem mendeteksi duplikasi dan menampilkan pesan penolakan.
4. **Hapus Pengurus**: Menghapus data pengurus melalui modal konfirmasi, status kepengurusan terhapus tanpa menghapus warga asli di tabel `users`.

#### Rekaman Demo & Hasil Pengujian Fitur Struktur Organisasi
- Rekaman Demo Struktur Organisasi CRUD Flow:
  ![verify_struktur_crud_flow](C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_all_custom_dropdowns_flow_1784199102790.webp)

### E. Penyesuaian Global Seluruh Dropdown List ke Model Kustom Search Dropdown
Semua inputan berformat dropdown list di seluruh fitur utama aplikasi kini telah bermigrasi ke model dropdown kustom premium dengan kolom pencarian real-time dan ber-border radius 2xl:
1. **Data Warga**: Dropdown pilihan RT/RW dan Peran (Role) di form Tambah/Edit Warga.
2. **Master RT-RW**: Dropdown pilihan RW Penaung di form Tambah/Edit RT.
3. **Informasi Kegiatan**: Dropdown pilihan Kategori Kegiatan di form Tambah/Edit Kegiatan.
4. **Transaksi Iuran**: Dropdown pilihan Metode Pembayaran di form Pembayaran/Verifikasi Iuran.

#### Rekaman Demo Penyesuaian Dropdown Global
- Demo Verifikasi Refactor Dropdown Global:
  ![verify_all_custom_selects_refactor](C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_all_custom_selects_refactor_1784199795978.webp)
- Demo Verifikasi Kategori Dropdown Fix (Sukses Tanpa Crash):
  ![verify_informasi_kategori_dropdown_fix](C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_informasi_kategori_dropdown_fix_1784200198202.webp)

---

## Cara Menjalankan Halaman Data Warga, Informasi, RT-RW, & Struktur Organisasi di Aplikasi
1. Jalankan server Backend (`node server.js` atau `npm run dev` pada direktori `backend`).
2. Jalankan server Frontend (`npm run dev` pada direktori `frontend`).
3. Login ke aplikasi menggunakan nomor HP `081100000001` (Admin) atau `081100000002` (Warga) dengan password `password123`.
4. Klik tab menu **Data Warga**, **Informasi Kegiatan**, **Master RT-RW**, atau **Master Struktur** pada Sidebar.
5. Gunakan tombol aksi di masing-masing menu untuk mencoba fitur interaktif. Warga hanya memiliki hak akses *read-only* untuk Informasi Kegiatan, Master RT-RW, dan Master Struktur.
