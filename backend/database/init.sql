-- DDL Script for IPL RT Database (PostgreSQL)

-- 1. Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    nama_role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: menus
CREATE TABLE IF NOT EXISTS menus (
    id VARCHAR(36) PRIMARY KEY,
    nama_menu VARCHAR(100) NOT NULL,
    path_url VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Table: role_menus
CREATE TABLE IF NOT EXISTS role_menus (
    role_id VARCHAR(36),
    menu_id VARCHAR(36),
    PRIMARY KEY (role_id, menu_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- 4. Table: master_rw
CREATE TABLE IF NOT EXISTS master_rw (
    id VARCHAR(36) PRIMARY KEY,
    nomor_rw VARCHAR(5) NOT NULL,
    ketua_rw VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: master_rt
CREATE TABLE IF NOT EXISTS master_rt (
    id VARCHAR(36) PRIMARY KEY,
    rw_id VARCHAR(36) NOT NULL,
    nomor_rt VARCHAR(5) NOT NULL,
    ketua_rt VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rw_id) REFERENCES master_rw(id)
);

-- 6. Table: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    role_id VARCHAR(36) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    no_hp VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    blok_rumah VARCHAR(10),
    nomor_rumah VARCHAR(10),
    status_hunian VARCHAR(20) CHECK (status_hunian IN ('pemilik', 'penyewa')),
    rt_id VARCHAR(36),
    jumlah_penghuni INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (rt_id) REFERENCES master_rt(id)
);

-- Ensure column exists for existing databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS jumlah_penghuni INT DEFAULT 1;

-- 7. Table: master_iuran
CREATE TABLE IF NOT EXISTS master_iuran (
    id VARCHAR(36) PRIMARY KEY,
    nama_iuran VARCHAR(100) NOT NULL,
    nominal DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table: tagihan
CREATE TABLE IF NOT EXISTS tagihan (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    master_iuran_id VARCHAR(36) NOT NULL,
    bulan INT NOT NULL,
    tahun INT NOT NULL,
    nominal_tagihan DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'pending', 'paid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (master_iuran_id) REFERENCES master_iuran(id)
);

-- 9. Table: transaksi_pembayaran
CREATE TABLE IF NOT EXISTS transaksi_pembayaran (
    id VARCHAR(36) PRIMARY KEY,
    tagihan_id VARCHAR(36) NOT NULL,
    tanggal_bayar TIMESTAMP,
    bukti_pembayaran_url VARCHAR(255),
    dicatat_oleh VARCHAR(36),
    diverifikasi_oleh VARCHAR(36),
    tanggal_verifikasi TIMESTAMP,
    catatan_bendahara TEXT,
    metode_pembayaran VARCHAR(50) DEFAULT 'cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tagihan_id) REFERENCES tagihan(id),
    FOREIGN KEY (dicatat_oleh) REFERENCES users(id),
    FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id)
);

-- Ensure column exists for existing databases
ALTER TABLE transaksi_pembayaran ADD COLUMN IF NOT EXISTS metode_pembayaran VARCHAR(50) DEFAULT 'cash';
ALTER TABLE transaksi_pembayaran ADD COLUMN IF NOT EXISTS catatan_verifikasi TEXT;

-- 10. Table: informasi (Fitur Informasi & Kegiatan)
CREATE TABLE IF NOT EXISTS informasi (
    id VARCHAR(36) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    narasi TEXT NOT NULL,
    tanggal DATE NOT NULL,
    kategori VARCHAR(50) DEFAULT 'Kegiatan',
    foto_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- SEED DATA (DUMMY DATA)
-- ==========================================

-- Insert Roles
INSERT INTO roles (id, nama_role) VALUES 
('11111111-1111-1111-1111-111111111111', 'Admin'),
('22222222-2222-2222-2222-222222222222', 'Warga'),
('33333333-3333-3333-3333-333333333333', 'Petugas'),
('44444444-4444-4444-4444-444444444444', 'Bendahara')
ON CONFLICT (id) DO NOTHING;

-- Insert Master RW
INSERT INTO master_rw (id, nomor_rw, ketua_rw) VALUES
('rw010000-0000-0000-0000-000000000000', '010', 'Bapak RW 10')
ON CONFLICT (id) DO NOTHING;

-- Insert Master RT
INSERT INTO master_rt (id, rw_id, nomor_rt, ketua_rt) VALUES
('rt001000-0000-0000-0000-000000000000', 'rw010000-0000-0000-0000-000000000000', '001', 'Bapak RT 01'),
('rt002000-0000-0000-0000-000000000000', 'rw010000-0000-0000-0000-000000000000', '002', 'Bapak RT 02')
ON CONFLICT (id) DO NOTHING;

-- Insert Users
-- Note: The password for all these dummy users is 'password123'
-- Hash created with bcrypt: $2b$10$OrYeZmAOhkpwrGckKitZde5gvME8pgWPEg92mYqiAyYM7a9S04dL6
INSERT INTO users (id, role_id, nama_lengkap, no_hp, password_hash, blok_rumah, nomor_rumah, status_hunian, rt_id) VALUES 
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Budi Admin', '081100000001', '$2b$10$OrYeZmAOhkpwrGckKitZde5gvME8pgWPEg92mYqiAyYM7a9S04dL6', 'A', '1', 'pemilik', 'rt001000-0000-0000-0000-000000000000'),
('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Agus Warga', '081100000002', '$2b$10$OrYeZmAOhkpwrGckKitZde5gvME8pgWPEg92mYqiAyYM7a9S04dL6', 'B', '12', 'pemilik', 'rt001000-0000-0000-0000-000000000000'),
('cccc3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Siti Warga', '081100000003', '$2b$10$OrYeZmAOhkpwrGckKitZde5gvME8pgWPEg92mYqiAyYM7a9S04dL6', 'B', '14', 'penyewa', 'rt002000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert Master Iuran
INSERT INTO master_iuran (id, nama_iuran, nominal) VALUES 
('dddd4444-4444-4444-4444-444444444444', 'IPL Standar Warga', 150000.00)
ON CONFLICT (id) DO NOTHING;


-- Seed initial data for informasi
INSERT INTO informasi (id, judul, narasi, tanggal, kategori, foto_url, video_url) VALUES
(
    'info1111-1111-1111-1111-111111111111',
    'Kerja Bakti Bersama RT 01 & 02',
    'Kegiatan rutin bulanan kerja bakti membersihkan saluran air dan merapikan taman lingkungan RT 01 dan RT 02. Harap membawa peralatan masing-masing seperti cangkul, sapu lidi, dan parang. Konsumsi berupa makanan berat dan ringan akan disediakan oleh ibu-ibu PKK.',
    '2026-07-12',
    'Kerja Bakti',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    'https://www.w3schools.com/html/mov_bbb.mp4'
),
(
    'info2222-2222-2222-2222-222222222222',
    'Rapat Bulanan Pengurus RT 001',
    'Rapat rutin bulanan pengurus RT 001 untuk membahas laporan keuangan iuran warga bulan Juni, penyusunan rencana keamanan malam (siskamling), dan perencanaan awal menyambut perayaan HUT RI tingkat RW. Diharapkan kehadiran seluruh ketua seksi dan perwakilan warga Blok A dan B.',
    '2026-07-15',
    'Rapat RT',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    ''
),
(
    'info3333-3333-3333-3333-333333333333',
    'Posyandu Balita & Lansia RW 010',
    'Pos pelayanan terpadu (Posyandu) kembali hadir untuk melayani penimbangan berat badan balita, pemberian imunisasi tambahan, serta pemeriksaan tekanan darah dan gula darah bagi lansia di lingkungan RW 010. Kegiatan ini berlangsung di Balai Warga dari pukul 08.00 s/d 11.00 WIB.',
    '2026-07-20',
    'Kesehatan',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    ''
),
(
    'info4444-4444-4444-4444-444444444444',
    'Sosialisasi Pemilahan Sampah Rumah Tangga',
    'Kegiatan sosialisasi mengenai pentingnya memilah sampah organik, anorganik, dan sampah B3 di rumah masing-masing. Acara ini bekerja sama dengan Komunitas Bank Sampah dan Dinas Lingkungan Hidup. Setiap perwakilan KK yang hadir akan mendapatkan komposter gratis.',
    '2026-07-25',
    'Sosialisasi',
    'https://images.unsplash.com/photo-1532996127006-02fc72ca8a2b?auto=format&fit=crop&q=80&w=800',
    ''
),
(
    'info5555-5555-5555-5555-555555555555',
    'Senam Pagi Sehat Warga RW 010',
    'Senam pagi sehat bersama warga untuk meningkatkan daya tahan tubuh. Disediakan bubur kacang hijau gratis dan undian berhadiah menarik di akhir acara.',
    '2026-07-27',
    'Olahraga',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    'https://www.w3schools.com/html/mov_bbb.mp4'
)
ON CONFLICT (id) DO NOTHING;
