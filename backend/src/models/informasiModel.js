const pool = require('../config/db');

const Informasi = {
    // Get all informasi, sorted by date descending
    async getAll() {
        const query = 'SELECT * FROM informasi ORDER BY tanggal DESC, created_at DESC';
        const [rows] = await pool.query(query);
        return rows;
    },

    // Get 5 latest informasi
    async getLatest() {
        const query = 'SELECT * FROM informasi ORDER BY tanggal DESC, created_at DESC LIMIT 5';
        const [rows] = await pool.query(query);
        return rows;
    },

    // Find by ID
    async getById(id) {
        const query = 'SELECT * FROM informasi WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Create new informasi
    async create(infoData) {
        const query = `
            INSERT INTO informasi (
                id, 
                judul, 
                narasi, 
                tanggal, 
                kategori, 
                foto_url, 
                video_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            infoData.id,
            infoData.judul,
            infoData.narasi,
            infoData.tanggal,
            infoData.kategori || 'Kegiatan',
            infoData.foto_url || null,
            infoData.video_url || null
        ];
        const [result] = await pool.query(query, params);
        return result;
    },

    // Update informasi
    async update(id, infoData) {
        const query = `
            UPDATE informasi SET 
                judul = ?, 
                narasi = ?, 
                tanggal = ?, 
                kategori = ?, 
                foto_url = ?, 
                video_url = ?
            WHERE id = ?
        `;
        const params = [
            infoData.judul,
            infoData.narasi,
            infoData.tanggal,
            infoData.kategori || 'Kegiatan',
            infoData.foto_url || null,
            infoData.video_url || null,
            id
        ];
        const [result] = await pool.query(query, params);
        return result;
    },

    // Delete informasi
    async delete(id) {
        const query = 'DELETE FROM informasi WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result;
    }
};

module.exports = Informasi;
