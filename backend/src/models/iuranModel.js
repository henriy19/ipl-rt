const pool = require('../config/db');

const Iuran = {
    // Get all iuran
    async getAll() {
        const query = 'SELECT * FROM master_iuran ORDER BY created_at DESC';
        const [rows] = await pool.query(query);
        return rows;
    },

    // Find iuran by ID
    async getById(id) {
        const query = 'SELECT * FROM master_iuran WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Create new iuran
    async create(iuranData) {
        const query = `
            INSERT INTO master_iuran (
                id, 
                nama_iuran, 
                nominal, 
                is_active
            ) VALUES (?, ?, ?, ?)
        `;
        const params = [
            iuranData.id,
            iuranData.nama_iuran,
            iuranData.nominal,
            iuranData.is_active !== undefined ? iuranData.is_active : true
        ];
        const [result] = await pool.query(query, params);
        return result;
    },

    // Update iuran
    async update(id, iuranData) {
        const query = `
            UPDATE master_iuran SET 
                nama_iuran = ?, 
                nominal = ?, 
                is_active = ?
            WHERE id = ?
        `;
        const params = [
            iuranData.nama_iuran,
            iuranData.nominal,
            iuranData.is_active !== undefined ? iuranData.is_active : true,
            id
        ];
        const [result] = await pool.query(query, params);
        return result;
    },

    // Delete iuran
    async delete(id) {
        const query = 'DELETE FROM master_iuran WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result;
    }
};

module.exports = Iuran;
