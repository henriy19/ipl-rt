# Rencana Implementasi: Fase 2 (Project Initialization)

Fase ini bertujuan untuk membuat kerangka kerja (scaffolding) untuk Backend dan Frontend sesuai dengan dokumen arsitektur yang telah kita sepakati pada Fase 1.

## Proposed Changes

### 1. Inisialisasi Backend (Node.js + Express)
Kita akan membuat direktori `backend` dan mengatur server dasar API di dalam workspace `c:\Nitip\hf\lab training\ipl-rt\`.
- **Dependencies Utama:** `express`, `cors`, `dotenv`, `mysql2` (beserta ORM jika disetujui), `uuid` (untuk UUID PK/FK), `jsonwebtoken` (Auth), dan `bcryptjs` (Hashing).
- **Struktur Folder:** Membuat hierarki `src/` yang terdiri dari `config`, `controllers`, `middlewares`, `models`, `routes`, `services`, dan `utils`.
- **Database Connection:** Membuat script koneksi awal (`config/database.js`) menuju MySQL (kredensial database sementara akan diarahkan ke localhost).
- **Entry Point:** Membuat file `server.js` dan `src/app.js` untuk menjalankan Express pada port 5000.

### 2. Inisialisasi Frontend (React + Vite)
Kita akan membuat direktori `frontend` menggunakan Vite untuk React.
- **Dependencies Utama:** `react`, `react-dom`, `react-router-dom` (Routing), `axios` (HTTP Client), `lucide-react` (Icons).
- **Tailwind CSS:** Melakukan instalasi dan konfigurasi Tailwind CSS untuk desain UI.
- **Struktur Folder:** Membuat hierarki `src/` dengan pendekatan feature-based (`components`, `features`, `layouts`, `routes`, dll).
- **Konfigurasi Awal:** Menyiapkan rute dasar dan setup `axios` instance yang mengarah ke `http://localhost:5000/api`.

## Verification Plan
1. Menjalankan `npm run dev` pada folder `backend` untuk memastikan server API menyala tanpa error.
2. Menjalankan `npm run dev` pada folder `frontend` untuk memastikan halaman Vite + Tailwind React terbuka dengan sukses di browser.
