const pool = require('../config/db');

const Iuran = {
    // Get all iuran
    async getAll() {
        const query = 'SELECT * FROM master_iuran ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Find iuran by ID
    async getById(id) {
        const query = 'SELECT * FROM master_iuran WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
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
            ) VALUES ($1, $2, $3, $4)
        `;
        const params = [
            iuranData.id,
            iuranData.nama_iuran,
            iuranData.nominal,
            iuranData.is_active !== undefined ? iuranData.is_active : true
        ];
        const { rowCount } = await pool.query(query, params);
        return { affectedRows: rowCount };
    },

    // Update iuran
    async update(id, iuranData) {
        const query = `
            UPDATE master_iuran SET 
                nama_iuran = $1, 
                nominal = $2, 
                is_active = $3
            WHERE id = $4
        `;
        const params = [
            iuranData.nama_iuran,
            iuranData.nominal,
            iuranData.is_active !== undefined ? iuranData.is_active : true,
            id
        ];
        const { rowCount } = await pool.query(query, params);
        return { affectedRows: rowCount };
    },

    // Delete iuran
    async delete(id) {
        const query = 'DELETE FROM master_iuran WHERE id = $1';
        const { rowCount } = await pool.query(query, [id]);
        return { affectedRows: rowCount };
    }
};

module.exports = Iuran;
