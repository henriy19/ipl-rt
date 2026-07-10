-- SQL Migration for Table: informasi (PostgreSQL)

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

-- Delete existing records to avoid duplicate primary keys on re-run
DELETE FROM informasi WHERE id IN (
    'info1111-1111-1111-1111-111111111111',
    'info2222-2222-2222-2222-222222222222',
    'info3333-3333-3333-3333-333333333333',
    'info4444-4444-4444-4444-444444444444',
    'info5555-5555-5555-5555-555555555555'
);

-- Seed initial data
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
    'Mari bergabung dalam senam pagi bersama seluruh warga RW 010 dengan dipandu oleh instruktur profesional demi menjaga kesehatan dan kebugaran tubuh. Disediakan sarapan bubur kacang hijau serta undian doorprize menarik (kipas angin, rice cooker, dll) di akhir acara!',
    '2026-07-27',
    'Olahraga',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    'https://www.w3schools.com/html/mov_bbb.mp4'
)
ON CONFLICT (id) DO NOTHING;
