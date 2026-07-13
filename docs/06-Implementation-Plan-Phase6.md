# Rencana Implementasi: Fase 6 (Modul Transaksi & Report)

Dokumen ini berisi rencana teknis untuk implementasi **Modul Transaksi (Tagihan & Pembayaran)** dan **Modul Report (Keuangan & Tunggakan)** pada aplikasi Wargatify, baik dari sisi Backend maupun Frontend.

---

## 1. Perubahan Skema Database
Untuk mendukung pencatatan metode pembayaran, kita perlu menambahkan kolom baru pada tabel `transaksi_pembayaran`.

*   **Berkas**: `backend/database/init.sql`
*   **Perubahan**:
    ```sql
    -- Menambahkan kolom metode_pembayaran pada tabel transaksi_pembayaran
    ALTER TABLE transaksi_pembayaran ADD COLUMN IF NOT EXISTS metode_pembayaran VARCHAR(50) DEFAULT 'cash';
    ```

---

## 2. Abstraksi Database (Backend Models)

### A. Model Tagihan & Pembayaran
*   **Berkas Baru**: `backend/src/models/tagihanModel.js`
*   **Fungsi Utama**:
    *   `generateBulanan(bulan, tahun)`: Mengambil semua warga aktif (peran 'Warga' & `is_active = true`), mencocokkannya dengan iuran aktif (`master_iuran` di mana `is_active = true`), lalu melakukan `INSERT INTO tagihan` jika belum pernah dibuat untuk periode tersebut.
    *   `getAll(filters)`: Mengambil daftar seluruh tagihan dengan join ke tabel `users` (nama, blok, nomor_rumah, no_hp) dan `master_iuran` (nama iuran), disertai filter `bulan`, `tahun`, dan `status`.
    *   `getByWargaId(userId)`: Mengambil seluruh tagihan khusus warga bersangkutan untuk riwayat pribadi.
    *   `getById(id)`: Mengambil detail tagihan tertentu.
    *   `bayar(tagihanId, paymentData)`: Memperbarui status tagihan menjadi `'paid'` dan membuat baris transaksi pembayaran di tabel `transaksi_pembayaran` dengan parameter `tanggal_bayar`, `metode_pembayaran`, `catatan_bendahara`, dan operator pencatat (`dicatat_oleh`, `diverifikasi_oleh`).

### B. Model Laporan (Reports)
*   **Berkas Baru**: `backend/src/models/reportModel.js`
*   **Fungsi Utama**:
    *   `getPemasukanBulanan(tahun)`: Mengambil akumulasi nominal pembayaran per bulan yang berstatus `'paid'` untuk tahun tertentu.
    *   `getTunggakanWarga(bulan, tahun)`: Mengambil seluruh daftar tagihan yang masih berstatus `'unpaid'` untuk periode tertentu, lengkap dengan nama warga, blok/nomor rumah, nama iuran, dan nominal tunggakan.

---

## 3. Logika Bisnis (Backend Controllers)

### A. Tagihan Controller
*   **Berkas Baru**: `backend/src/controllers/tagihanController.js`
*   **Fungsi**:
    *   `GenerateTagihan`: Men-generate tagihan IPL bulanan secara massal. Menerima request body `bulan` dan `tahun` (default ke bulan & tahun saat ini jika kosong).
    *   `GetAllTagihan`: Mengambil semua tagihan (hanya untuk Admin/Bendahara/Petugas).
    *   `GetWargaHistory`: Mengambil riwayat tagihan pribadi (untuk warga biasa).
    *   `BayarTagihan`: Menandai lunas pembayaran warga (pembayaran tunai/transfer langsung diverifikasi seketika oleh operator).

### B. Report Controller
*   **Berkas Baru**: `backend/src/controllers/reportController.js`
*   **Fungsi**:
    *   `GetRekapitulasi`: Mengembalikan rangkuman keuangan yang mencakup total pemasukan bulanan sepanjang tahun tertentu serta daftar warga yang masih menunggak tagihan pada periode tersebut.

---

## 4. Routing API (Backend Routes)
Menghubungkan controller dengan endpoint HTTP serta menerapkan proteksi keamanan JWT dan pengecekan otorisasi peran (RBAC).

*   **Berkas Baru**: `backend/src/routes/tagihanRoutes.js`
*   **Berkas Baru**: `backend/src/routes/reportRoutes.js`
*   **Integrasi di Berkas**: [app.js](file:///c:/Nitip/hf/lab%20training/ipl-rt/backend/src/app.js)
    ```javascript
    const tagihanRoutes = require('./routes/tagihanRoutes');
    const reportRoutes = require('./routes/reportRoutes');
    
    app.use('/api/tagihan', tagihanRoutes);
    app.use('/api/report', reportRoutes);
    ```

---

## 5. Antarmuka Pengguna (Frontend UI)

### A. Halaman Transaksi (`Transaksi.jsx`)
*   **Tujuan**: Menggantikan placeholder `frontend/src/features/transaksi/Transaksi.jsx`.
*   **Desain & Fitur**:
    *   **Filter Pencarian**: Dropdown bulan, tahun, dan status pembayaran (`paid` / `unpaid`).
    *   **Aksi Generate Tagihan**: Tombol khusus untuk men-generate tagihan warga aktif secara massal pada bulan terpilih.
    *   **Tabel Data Transaksi**: Daftar pembayaran warga lengkap dengan nama, nomor rumah, RT/RW, nama iuran, nominal, dan badge status pembayaran.
    *   **Tombol "Tandai Lunas"**: Terbuka jika tagihan berstatus `'unpaid'`. Aksi ini memicu modal input untuk memilih Metode Pembayaran (`'cash'` atau `'transfer'`) dan catatan singkat dari bendahara.
    *   **Keamanan RBAC**: Membatasi tombol "Tandai Lunas" dan "Generate Tagihan" agar hanya tampil bagi peran pengurus RT/RW (Admin, Bendahara, Petugas). Warga hanya bisa melihat daftar tagihan pribadi mereka sendiri.

### B. Halaman Laporan (`Laporan.jsx`)
*   **Tujuan**: Menggantikan placeholder `frontend/src/features/laporan/Laporan.jsx`.
*   **Desain & Fitur**:
    *   **Kartu Informasi Utama**: Menampilkan Total Pemasukan Tahun Ini dan Total Tunggakan Warga.
    *   **Rangkuman Pemasukan Bulanan**: Tabel rekapitulasi nominal uang masuk per bulan (Januari s.d. Desember).
    *   **Tabel Daftar Tunggakan**: Menampilkan daftar warga yang belum membayar iuran untuk mempermudah penagihan.
    *   **Fitur Ekspor PDF**: Menggunakan metode clean-printing browser (`window.print()`) dengan CSS `@media print` terformat untuk mengekspor rekapitulasi keuangan dan daftar tunggakan ke berkas PDF secara instan tanpa membebani performa browser dengan library eksternal.

---

## 6. Rencana Verifikasi (Verification Plan)
1. **Inisialisasi Database**: Jalankan backend, pastikan kolom `metode_pembayaran` sukses ditambahkan ke PostgreSQL lokal.
2. **Uji Generate Tagihan**: Trigger endpoint `POST /api/tagihan/generate` dan pastikan tagihan untuk 3 warga dummy (Budi, Agus, Siti) otomatis terbuat di database.
3. **Uji Pembayaran**: Trigger `POST /api/tagihan/:id/bayar` untuk mengubah status tagihan menjadi lunas dan periksa data baru di tabel `transaksi_pembayaran`.
4. **Uji Laporan Keuangan**: Hit API `/api/report/rekapitulasi` untuk memastikan data nominal pemasukan tahunan terhitung akurat.
5. **Uji UI**: Login sebagai Admin, lakukan pembayaran salah satu warga, lalu verifikasi bahwa status berubah dari merah ("Tunggakan") menjadi hijau ("Lunas"). Lakukan print PDF untuk memastikan tata letak dokumen cetak rapi.
