# Rencana Implementasi: Fase 3 (Frontend UI/UX & Routing Dashboard)

Fase ini berfokus pada perancangan antarmuka pengguna (UI) dan pengalaman pengguna (UX) untuk aplikasi web menggunakan React dan Tailwind CSS. Kita akan membangun struktur tata letak (layout) utama yang responsif, sistem navigasi (*routing*), serta halaman *Dashboard* interaktif dengan data statis (*mock data*).

## Proposed Changes

### 1. Global Layout & Navigation
Kita akan membangun komponen struktural yang membungkus seluruh halaman aplikasi.
- **`Sidebar.jsx`**:
  - Berisi daftar menu navigasi utama: Dashboard, Data Warga, Master Iuran, Transaksi, Laporan.
  - Memiliki desain yang elegan dan profesional (kemungkinan menggunakan palet warna biru/slate gelap).
- **`Header.jsx`**:
  - Berisi informasi profil user (avatar/nama) dan tombol logout.
  - Menampilkan tombol *Hamburger* (menu toggle) khusus saat diakses melalui perangkat seluler (Mobile).
- **`MainLayout.jsx`**:
  - Menggabungkan `Sidebar` dan `Header` sebagai kerangka utama.
  - **Responsivitas (Mobile-First):** Di layar kecil/HP, *Sidebar* akan disembunyikan dan dapat dimunculkan/ditutup melalui *hamburger menu* dari *Header*.

### 2. Konfigurasi Routing
- **`App.jsx`**:
  - Menggunakan `react-router-dom` (`BrowserRouter`, `Routes`, `Route`) untuk mengatur perpindahan antar halaman.
  - Halaman-halaman utama (seperti `/`, `/warga`, `/iuran`, dll) akan dibungkus di dalam `<MainLayout />`.

### 3. Halaman Dashboard (`Dashboard.jsx`)
- Halaman pertama yang dilihat pengguna setelah masuk.
- **Summary Cards (Statistik Cepat):**
  - **Total Warga**: Menampilkan jumlah warga yang terdaftar.
  - **Total Pemasukan Bulan Ini**: Menampilkan akumulasi pembayaran IPL bulan berjalan.
  - **Total Tunggakan**: Menampilkan akumulasi tagihan warga yang belum dibayar.
- **Desain UI/UX:**
  - *Cards* didesain modern menggunakan *soft shadows* (`shadow-md` atau `shadow-lg`), *rounded corners* (`rounded-xl` atau `rounded-2xl`), dan *whitespace* yang longgar.
  - Menggunakan kumpulan *icon* relevan dari `lucide-react` (seperti icon dompet, icon pengguna, icon kalender) untuk mempercantik data.
  - **Data Statis:** Sementara waktu, data angka akan diisi (di-hardcode) dengan *mock data* di sisi komponen React sebelum diintegrasikan dengan API asli di Fase selanjutnya.

## Verification Plan
- Menjalankan React (Vite) server `npm run dev`.
- Menguji responsivitas UI dengan membuka *Developer Tools* browser dan meresize layar ke ukuran Mobile (HP) guna memastikan fitur sembunyi-muncul (collapse) dari *Sidebar* berjalan baik.
- Memastikan semua rute (/dashboard, /warga, dll) memuat `MainLayout` dengan benar tanpa error di konsol.
