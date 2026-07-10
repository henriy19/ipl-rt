# Walkthrough Fase 1: Analisis Bisnis & Desain Database

Fase 1 memfokuskan pada pemetaan alur bisnis sistem manajemen IPL RT serta perancangan skema database relasional (MySQL) yang scalable menggunakan UUID.

## 1. Analisis Alur Kerja Bisnis (Business Flow)
Telah didefinisikan 4 aktor utama beserta wewenangnya:
- **Warga**: Login, melihat dashboard kas/iuran, melakukan konfirmasi pembayaran (transfer manual) dan melacak riwayat pembayaran.
- **Admin**: Mengelola pengguna (Warga, Pengurus), mengatur *Role-Based Access Control* (RBAC), konfigurasi master iuran, dan melihat laporan rekapitulasi per bulan.
- **Petugas**: Melakukan generate tagihan bulanan warga serta mencatat iuran yang dibayar secara tunai.
- **Bendahara**: Memvalidasi konfirmasi transfer/bukti bayar dari warga atau menyetujui laporan setoran tunai dari petugas untuk mengubah status tagihan menjadi lunas.

## 2. Struktur Folder & Desain Sistem
Menerapkan pendekatan modular yang teratur:
- **Backend (Express + Node.js)**: Terstruktur dengan model MVC/Layered Architecture (Routes -> Controllers -> Models -> Config).
- **Frontend (Vite + React.js)**: Terstruktur dengan *Feature-based modules* (features/auth, features/dashboard, features/warga, layouts, routes, services).

## 3. Desain Skema Database (MySQL)
Skema relasional mencakup 7 tabel utama dengan tipe primary/foreign key `VARCHAR(36)` (UUID):
1. **`roles`**: Tabel dinamis penyimpan jenis peran (Admin, Warga, Petugas, Bendahara).
2. **`menus`**: Menyimpan daftar menu aplikasi.
3. **`role_menus`**: Menyimpan pemetaan menu akses yang dimiliki oleh tiap role (RBAC).
4. **`users`**: Menyimpan data autentikasi dan profil pengguna lengkap dengan status hunian dan wilayah RT/RW.
5. **`master_iuran`**: Berisi konfigurasi jenis-jenis iuran dan nominalnya.
6. **`tagihan`**: Rekaman tagihan bulanan per warga.
7. **`transaksi_pembayaran`**: Pencatatan transaksi pembayaran lengkap dengan bukti pembayaran.

---
> [!NOTE]
> Semua keputusan arsitektur di atas telah didokumentasikan di file [01-Architecture-And-Guidelines.md](file:///c:/Nitip/hf/lab%20training/ipl-rt/docs/01-Architecture-And-Guidelines.md).
