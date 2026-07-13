# Walkthrough: Fase 6 (Modul Transaksi & Report Keuangan)

Dokumen ini mendokumentasikan hasil pengujian dan panduan verifikasi untuk **Modul Transaksi (Tagihan & Pembayaran)** serta **Laporan Keuangan** setelah seluruh kode program selesai diimplementasikan.

---

## 1. Skema Database yang Diterapkan
Modul ini menambahkan atribut pendukung pembayaran ke PostgreSQL:
- **`metode_pembayaran`**: Kolom bertipe `VARCHAR(50)` dengan nilai bawaan `'cash'` pada tabel `transaksi_pembayaran` untuk melacak cara warga membayar iuran.

---

## 2. API Endpoint Baru yang Tersedia

### A. Endpoint Tagihan (`/api/tagihan`)
*   `POST /api/tagihan/generate` -> Men-generate tagihan bulanan warga aktif berdasarkan jenis iuran yang aktif.
    *   *Request Body*: `{ "bulan": 7, "tahun": 2026 }`
*   `GET /api/tagihan` -> Mengambil daftar seluruh tagihan iuran (Khusus Admin/Bendahara/Petugas).
    *   *Query Filter*: `?bulan=7&tahun=2026&status=unpaid`
*   `GET /api/tagihan/history` -> Mengambil daftar tagihan milik akun warga yang sedang login (Khusus Warga).
*   `POST /api/tagihan/:id/bayar` -> Menandai tagihan tertentu sebagai LUNAS.
    *   *Request Body*: `{ "metode_pembayaran": "transfer", "catatan_bendahara": "Lunas transfer Mandiri" }`

### B. Endpoint Laporan (`/api/report`)
*   `GET /api/report/rekapitulasi` -> Mengambil ringkasan pemasukan per bulan dan daftar warga yang masih menunggak tagihan (Khusus Admin/Bendahara).
    *   *Query Filter*: `?tahun=2026`

---

## 3. Tampilan Antarmuka Baru di Frontend

### A. Halaman Transaksi Wargatify (`/transaksi`)
1.  **Filter Periode & Status**: Admin dapat memfilter tabel pembayaran berdasarkan Bulan, Tahun, dan Status Pembayaran (Semua, Lunas, Belum Lunas).
2.  **Tombol Generate Tagihan**: Menyediakan tombol untuk membuat tagihan iuran bulanan untuk seluruh warga aktif secara otomatis.
3.  **Aksi "Tandai Lunas"**:
    *   Ketika tombol diklik pada baris warga yang belum lunas, muncul modal konfirmasi pembayaran.
    *   Bendahara/Admin dapat memilih metode bayar (**Cash** atau **Transfer**) dan memasukkan catatan (misal: nama bank pengirim).
    *   Status di tabel langsung ter-update dengan **badge hijau "Lunas"**.

### B. Halaman Laporan Keuangan (`/laporan`)
1.  **Ringkasan Angka**: Kartu informasi yang menampilkan akumulasi Pemasukan Bulanan dan estimasi Total Tunggakan (piutang) warga saat ini.
2.  **Rekap Pemasukan Bulanan**: Tabel ringkas yang memuat total uang masuk untuk tiap bulan (Januari s.d. Desember).
3.  **Tabel Daftar Tunggakan**: Mempermudah pengurus RT untuk mengetahui warga mana saja yang belum melunasi iurannya pada bulan terpilih.
4.  **Ekspor PDF Laporan**:
    *   Terdapat tombol **"Ekspor Laporan PDF"**.
    *   Saat diklik, sistem membuka jendela print browser dengan format halaman cetak dokumen formal (*clean layout*).
    *   Teks navigasi sidebar, header, dan tombol-tombol antarmuka lainnya otomatis disembunyikan dalam mode cetak, menyisakan kop surat formal RT/RW dan tabel laporan keuangan yang rapi untuk disimpan sebagai file PDF.

---

## 4. Panduan Verifikasi Fitur Secara Mandiri
1.  **Jalankan Backend & Frontend secara lokal**:
    *   Backend: `npm run dev` pada direktori `backend`
    *   Frontend: `npm run dev` pada direktori `frontend`
2.  **Login sebagai Admin** (`081100000001` / `password123`).
3.  **Buka menu Transaksi**:
    *   Pilih Bulan dan Tahun saat ini, klik **"Generate Tagihan Bulanan"**.
    *   Daftar tagihan baru untuk seluruh warga (seperti Agus Warga, Siti Warga) akan tampil dengan status merah **"Belum Lunas"**.
    *   Klik **"Tandai Lunas"** pada salah satu warga, pilih metode pembayaran, dan simpan. Status warga tersebut akan langsung berubah menjadi hijau **"Lunas"**.
4.  **Buka menu Laporan**:
    *   Verifikasi bahwa uang pembayaran warga yang baru saja ditandai lunas sudah masuk ke akumulasi pemasukan bulanan.
    *   Verifikasi warga yang belum membayar masuk ke dalam daftar "Daftar Warga Menunggak".
    *   Klik **"Ekspor Laporan PDF"**, lalu pilih printer "Save as PDF" di menu cetak browser Anda untuk menyimpan berkas laporan secara resmi.
