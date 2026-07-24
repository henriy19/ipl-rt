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
4. **Transaksi Iuran (Form Pembayaran)**: Dropdown pilihan Metode Pembayaran di form Pembayaran/Verifikasi Iuran.
5. **Transaksi Iuran (Filter Utama)**: Dropdown filter Bulan, Tahun, dan Status di bagian filter dashboard depan halaman Transaksi.

#### Rekaman Demo Penyesuaian Dropdown Global
- Demo Verifikasi Refactor Dropdown Global:
  ![verify_all_custom_selects_refactor](C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_all_custom_selects_refactor_1784199795978.webp)
- Demo Verifikasi Kategori Dropdown Fix (Sukses Tanpa Crash):
  ![verify_informasi_kategori_dropdown_fix](C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_informasi_kategori_dropdown_fix_1784200198202.webp)
- Demo Verifikasi Dropdown Filter Utama Transaksi:
  ![verify_transaksi_filter_dropdowns](C:/Users/IDX-203/.gemini/antigravity-ide/brain/9387bfd5-4de8-4aab-bd53-3424984850b0/verify_transaksi_filter_dropdowns_1784201465583.webp)

### F. Fitur Upload & Upsert Data Warga via Excel (Baru)
1. **Unduh Template**: Admin mengklik tombol "Download Template" di header halaman Data Warga untuk menyimpan cetakan format berkas Excel yang benar di komputernya.
2. **Pemicu Aksi**: Admin mengklik tombol "Upload Excel" di header halaman Data Warga.
3. **Modal Dialog**: Muncul modal dialog yang memuat panduan struktur kolom Excel yang dibutuhkan.
4. **Pemrosesan File**: Admin memilih file Excel (.xlsx / .xls), lalu mengklik "Mulai Upload". File diubah ke format Base64 dan diposting ke `/api/users/upload-excel`.
5. **Pembaruan & Upsert di Database**: Backend memproses file Excel tersebut. Warga dengan nomor HP yang sudah ada akan di-update datanya (upsert), sedangkan warga dengan nomor HP baru akan di-insert secara otomatis dengan password bawaan `password123`.
6. **Konfirmasi Sukses**: Setelah proses selesai, halaman akan memuat pesan sukses dari response server dan tabel data warga akan ter-refresh otomatis untuk menampilkan data ter-update.

### G. Fitur Laporan Data Warga dengan Filter RT (Baru)
1. **Navigasi**: Pengguna menavigasi ke menu "Laporan" pada sidebar.
2. **Perpindahan Tab**: Pengguna mengklik tab "Laporan Data Warga".
3. **Filter RT**: Pengguna memilih nomor RT dari dropdown filter kustom (misal: "RT 001").
4. **Metrik Statistik**: Sistem menampilkan metrik ringkasan untuk RT terpilih secara dinamis: Total Kepala Keluarga (KK), Total Populasi (Jiwa), Jumlah Pemilik Hunian, dan Jumlah Penyewa Hunian.
5. **Daftar Warga**: Tabel menampilkan seluruh warga di RT terpilih beserta informasi Nama Lengkap, Nomor HP, Alamat, Status Hunian, Jumlah Penghuni, dan Status Keaktifan.
6. **Ekspor Laporan PDF**: Pengguna mengklik tombol "Ekspor PDF Data Warga". Sistem membuat lembar laporan warga berformat kop surat resmi dan secara langsung menyimpannya sebagai file PDF (.pdf) di folder download tanpa memicu dialog cetak printer bawaan browser.

### H. Perubahan Nama Dashboard Menjadi Beranda & Penyesuaian Lebar Penuh Halaman (Baru)
1. **Navigasi Sidebar**: Pengguna melihat menu teratas pada sidebar kini menampilkan teks "Beranda" (sebelumnya "Dashboard").
2. **Halaman Utama**: Saat diklik, pengguna dialihkan ke halaman utama dengan judul "Beranda", dan tata letak dasbor melebar memenuhi lebar layar tanpa menyisakan ruang kosong besar di sisi kanan dan kiri.

### I. Penyesuaian Lebar Penuh Halaman Informasi & Kegiatan (Baru)
1. **Halaman Informasi & Kegiatan**: Saat menavigasi ke menu "Informasi Kegiatan", tata letak daftar pengumuman melebar memenuhi lebar layar tanpa menyisakan ruang kosong besar di sisi kanan dan kiri.

### J. Fitur Filter RT - RW pada Halaman Data Warga (Baru)
1. **Navigasi**: Pengguna menavigasi ke menu "Data Warga".
2. **Pencarian & Filter RT**: Pengguna dapat memasukkan kata kunci pada bar pencarian atau mengklik dropdown "RT/RW" di sebelahnya.
3. **Pencarian dalam Dropdown RT**: Dropdown menyediakan input pencarian untuk menemukan nomor RT secara cepat.
4. **Pembaruan Real-Time**: Saat nomor RT dipilih (misal: "RT 001 / RW 010"), tabel warga dan 4 kartu statistik (Total KK, Total Jiwa, Pemilik, Penyewa) langsung tersaring menampilkan data warga RT terpilih.

### K. Fitur Filter RT pada Halaman Laporan Keuangan (Baru)
1. **Navigasi**: Pengguna menavigasi ke menu "Laporan" -> tab "Laporan Keuangan".
2. **Filter Bar**: Di samping filter Tahun dan Bulan Tunggakan, terdapat dropdown "Filter RT".
3. **Pemberlakuan Query Database**: Saat nomor RT dipilih (misal: "RT 001 / RW 010"), sistem secara otomatis mengambil ulang data dari PostgreSQL untuk menyajikan angka Pemasukan Kas Lunas, Total Tunggakan Aktif, Rekap Pemasukan Bulanan, dan Daftar Tagihan khusus untuk RT terpilih.

### L. Fitur Filter RT pada Halaman Transaksi Iuran (Baru)
1. **Navigasi**: Pengguna menavigasi ke menu "Transaksi".
2. **Filter Bar**: Di samping filter Bulan, Tahun, dan Status, terdapat dropdown "Filter RT".
3. **Pemberlakuan Query Database**: Saat nomor RT dipilih (misal: "RT 001 / RW 010"), sistem secara otomatis mengambil ulang data dari PostgreSQL untuk menyajikan 3 kartu statistik (Total Tagihan Periode Ini, Lunas, Belum Lunas) dan tabel tagihan warga khusus untuk RT terpilih.

### M. Fitur Filter RT pada Halaman Master Struktur Organisasi (Baru)
1. **Navigasi**: Pengguna menavigasi ke menu "Master Struktur".
2. **Filter Bar**: Di samping input pencarian utama, terdapat dropdown "Filter RT".
3. **Pemberlakuan Filter & Pengkinian Statistik**: Saat nomor RT dipilih (misal: "RT 001 / RW 010"), sistem secara otomatis menyaring daftar pengurus di tabel dan meng-update 3 kartu statistik (Total Pengurus, Pengurus Aktif, Warga Belum Masuk Struktur) khusus untuk RT terpilih.

### N. Input Tanggal Lahir, No. HP, & Relasi Detail Penghuni pada Data Warga (Baru)
1. **Input Tanggal Lahir Warga Utama**: Pada form Tambah / Edit Data Warga, admin dapat memasukkan informasi `Tanggal Lahir` untuk Warga Utama.
2. **Sub-Form Dinamis Detail Penghuni & Input No. HP**: Form menyediakan bagian "Detail Penghuni / Anggota Keluarga" di mana Warga Utama otomatis tercatat sebagai penghuni 1 (beserta No. HP & Tgl Lahir). Admin dapat mengklik "+ Tambah Anggota Penghuni" untuk menambah baris anggota keluarga (Nama Lengkap, No. HP opsional, & Tanggal Lahir) atau mengklik ikon sampah untuk menghapus.
3. **Kalkulasi Otomatis Jumlah Penghuni**: Nilai `jumlah_penghuni` tidak lagi diinput secara manual oleh user, tetapi dihitung otomatis oleh sistem dari total baris detail penghuni yang valid (1 Warga Utama + N Anggota Tambahan).
4. **Tabel Relasi PostgreSQL (`users_penghuni`)**: Setiap data penghuni tersimpan otomatis ke tabel `users_penghuni` (`id`, `no_hp`, `no_hp_penghuni`, `nama_lengkap`, `tanggal_lahir`) dengan foreign key `no_hp` ke tabel `users` (ON DELETE CASCADE ON UPDATE CASCADE).
5. **Modal Detail Profil Warga**: Saat ikon Mata (View Detail) diklik, sistem menampilkan informasi Tanggal Lahir Warga Utama dan menyajikan sub-tabel lengkap berisi seluruh Anggota Penghuni Rumah (termasuk kolom No. Handphone).

#### O. Konfigurasi Deployment Railway Multi-Direktori & Troubleshooting (Baru)
1. **Entrypoint Universal (`node server.js`)**: Pembuatan file jembatan entrypoint (`server.js` di Root, `backend/server.js`, `frontend/server.js`, dan `backend/backend/server.js`) sehingga perintah `node server.js` selalu menemukan file aplikasi di semua variasi opsi *Root Directory* Railway Dashboard (`/`, `/backend`, atau `/frontend`).
2. **Kompilasi Otomatis Production (`dist`)**: Konfigurasi `package.json` dan `nixpacks.toml` me-run `cd frontend && npm install && npm run build` untuk menghasilkan bundel SPA di folder `dist/` sebelum kontainer dinyalakan, mencegah halaman *white screen* akibat kode mentah JSX.
3. **Kompatibilitas Middleware Express 5.x**: Mengubah wildcard router `app.get('*', ...)` menjadi middleware `app.use((req, res, next) => ...)` untuk menghindari error `PathError: Missing parameter name at index 1: *`.
4. **Sinkronisasi Dependency Lockfile**: Menjalankan `npm install` pada folder frontend dan root untuk mengupdate `package-lock.json` sehingga perintah `npm ci` di Nixpacks Railway berjalan 100% lulus tanpa error ketidaksesuaian dependensi `express`.

### P. Standarisasi Layout, Padding, & Margin Ekspor PDF (Baru)
1. **Penerapan Internal Container Padding**: Penambahan `padding: 45px 55px;` langsung pada elemen `#print-content` agar `html2canvas` menangkap batas ruang kosong secara penuh.
2. **Margin Kertas A4 Simetris (~20mm)**: Pengaturan `iframe.style.width = '900px'` dan margin luar `8mm` di `jsPDF` untuk memberikan jarak margin kanan-kiri sekitar **2 cm (20mm)** di kertas A4 tanpa terpotong.
3. **Proporsi Sel Tabel & Kerapian Teks**: Perapihan *padding* sel header (`th: 12px 14px`) dan isi (`td: 10px 14px`) serta pembagian persentase lebar kolom yang presisi agar teks nama, nomor HP, alamat, dan status hunian tampil rapi.
4. **Desain Komponen Visual**: Pembaruan gaya *pill badge* status (Aktif/Nonaktif/Lunas/Tunggakan), penyelarasan *summary cards*, dan perapihan blok area tanda tangan.

---

## Cara Menjalankan Halaman Data Warga, Informasi, RT-RW, & Struktur Organisasi di Aplikasi
1. Jalankan server Backend (`node server.js` atau `npm run dev` pada direktori `backend`).
2. Jalankan server Frontend (`npm run dev` pada direktori `frontend`).
3. Login ke aplikasi menggunakan nomor HP `081100000001` (Admin) atau `081100000002` (Warga) dengan password `password123`.
4. Klik tab menu **Data Warga**, **Informasi Kegiatan**, **Master RT-RW**, atau **Master Struktur** pada Sidebar.
5. Gunakan tombol aksi di masing-masing menu untuk mencoba fitur interaktif. Warga hanya memiliki hak akses *read-only* untuk Informasi Kegiatan, Master RT-RW, dan Master Struktur.
