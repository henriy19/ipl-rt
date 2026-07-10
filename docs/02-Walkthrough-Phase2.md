# Walkthrough Fase 2: Inisiasi Proyek & Setup Koneksi

Sesuai dengan rencana implementasi pada Fase 2, berikut adalah seluruh inisialisasi awal (*scaffolding*) yang telah berhasil dijalankan:

## 1. Setup Backend (Node.js + Express)
Kerangka backend telah dibuat pada folder `backend`.
- Meng-inisialisasi `package.json` dan meng-install dependensi utama secara aktual (`express`, `cors`, `dotenv`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `uuid`) beserta `nodemon` untuk *development*.
- Men-generate struktur folder modular (feature-based separation) di dalam `src`: `config`, `routes`, `controllers`, `models`, `middlewares`, `services`, dan `utils`.
- Membuat file `src/config/db.js` yang memanfaatkan fitur *connection pool* `mysql2/promise` untuk koneksi efisien ke MySQL.
- Membuat konfigurasi `.env` dasar dan entry point aplikasi di `server.js` serta `src/app.js` yang sudah dilindungi oleh middleware dasar (CORS, Express JSON parser).

## 2. Setup Database (MySQL)
Script SQL DDL (`init.sql`) telah ditulis pada folder `backend/database/init.sql`.
- Script tersebut berisi sintaks pembuatan seluruh 7 tabel utama (`roles`, `menus`, `role_menus`, `users`, `master_iuran`, `tagihan`, `transaksi_pembayaran`).
- Setiap Primary Key dan Foreign Key *telah menggunakan tipe VARCHAR(36)* secara utuh untuk mendukung penyimpanan data UUID, sesuai revisi terakhir pada dokumen arsitektur.
- Script juga sudah dibekali dengan **Dummy Data** yang menggunakan format valid UUID untuk mempermudah saat tahap testing nanti. Termasuk: 4 jenis Role bawaan, 1 akun Admin, 2 akun Warga, serta konfigurasi nominal Iuran perdana.

## 3. Setup Frontend (React.js)
Proyek klien telah berhasil diinisialisasi melalui Vite di dalam `frontend`.
- Diinisiasi dengan *template react* standard (React 18/19).
- Melakukan instalasi package tambahan sesuai instruksi: `react-router-dom` untuk sistem routing, `axios` untuk HTTP client, dan `lucide-react`.
- Mengkonfigurasi **Tailwind CSS** (PostCSS config, instalasi *devDependencies*, dan file konfigurasi `tailwind.config.js` serta modifikasi `index.css`).
- Membuat struktur direktori Frontend yang rapi di bawah `src/`: `components`, `features` (pages), `services`, `layouts`, dan `utils`.

---
> [!NOTE]
> Database awal siap digunakan dengan mengeksekusi file `backend/database/init.sql` pada MySQL lokal Anda.
