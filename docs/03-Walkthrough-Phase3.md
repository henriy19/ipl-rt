# Walkthrough Fase 3: Frontend UI/UX & Routing Dashboard

Seluruh tata letak utama (Global Layout) dan integrasi Routing (React Router DOM) telah selesai diimplementasikan. Berikut adalah detail fungsionalitas yang telah dibangun:

## 1. Global Layout Component (100% Responsif)
Komponen ini dipecah ke dalam folder `src/layouts/`:
- **`MainLayout.jsx`**: Bertindak sebagai kerangka utama (wrapper) bagi seluruh halaman di dalam aplikasi.
- **`Sidebar.jsx`**: Berisi navigasi utama.
  - Pada Desktop: Sidebar terkunci (fixed) di sebelah kiri layar.
  - Pada Mobile: Sidebar secara otomatis disembunyikan dan diubah menjadi *Off-Canvas Menu* dengan latar belakang transparan (overlay hitam) ketika dibuka.
- **`Header.jsx`**: Menampilkan area kontrol.
  - Di sebelah kiri: Tombol `Hamburger Menu` (hanya muncul di Mobile/layar kecil).
  - Di sebelah kanan: Tombol Notifikasi dan Informasi Profil (Budi Admin) beserta tombol *Logout*.

## 2. Sistem Routing (React Router DOM)
File `App.jsx` telah sepenuhnya dibongkar ulang menggunakan `<BrowserRouter>` dan `<Routes>`.
- Menggunakan pendekatan *Nested Routes*, di mana seluruh rute dibungkus dalam `<MainLayout />`.
- Lima rute utama telah disiapkan:
  - `/` (Dashboard Utama)
  - `/warga` (Halaman Warga)
  - `/iuran` (Master Iuran)
  - `/transaksi` (Transaksi)
  - `/laporan` (Laporan)

## 3. Dashboard UI (Mock Data)
Desain Dashboard utama (`src/features/dashboard/Dashboard.jsx`) telah diwujudkan:
- **Premium Aesthetics:** Dirancang menggunakan Tailwind CSS dengan `shadow-sm`, `rounded-2xl`, warna background `bg-gray-50`, dan layout `grid` untuk kerapihan.
- Menggunakan ikon-ikon vektor yang diambil dari pustaka `lucide-react` dengan penambahan aksen *opacity* (seperti `bg-blue-50` dan ikon biru untuk statistik).
- **3 Summary Cards Utama** disajikan menggunakan data statis sementara:
  1. Total Warga: 145
  2. Total Pemasukan: Rp 4.500.000
  3. Total Tunggakan: Rp 1.250.000
- Terdapat komponen *Placeholder* "Transaksi Terbaru" bergaya *empty-state* di bawah Dashboard.

---
> [!NOTE]
> Server Vite dan Tailwind CSS telah dikonfigurasi untuk secara otomatis menerapkan perubahan. Buka `http://localhost:5173/` di *browser* untuk mulai menikmati UI baru aplikasi ini.
