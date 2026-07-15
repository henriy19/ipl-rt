const pool = require('../config/db');

const RW = {
    // Get all RW records
    async getAll() {
        const query = `
            SELECT id, nomor_rw, ketua_rw, is_active, created_at, updated_at
            FROM master_rw
            ORDER BY nomor_rw ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Get specific RW by ID
    async getById(id) {
        const query = `
            SELECT id, nomor_rw, ketua_rw, is_active, created_at, updated_at
            FROM master_rw
            WHERE id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Create new RW record
    async create(rwData) {
        const { id, nomor_rw, ketua_rw, is_active } = rwData;
        const query = `
            INSERT INTO master_rw (id, nomor_rw, ketua_rw, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, nomor_rw, ketua_rw, is_active ?? true]);
        return rows[0];
    },

    // Update existing RW record
    async update(id, rwData) {
        const { nomor_rw, ketua_rw, is_active } = rwData;
        const query = `
            UPDATE master_rw
            SET nomor_rw = $1, ketua_rw = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const { rows } = await pool.query(query, [nomor_rw, ketua_rw, is_active, id]);
        return rows[0];
    },

    // Delete RW record
    async delete(id) {
        const query = `
            DELETE FROM master_rw
            WHERE id = $1
        `;
        await pool.query(query, [id]);
        return true;
    },

    // Check if RW is associated with any RT
    async hasAssociatedRT(id) {
        const query = `
            SELECT COUNT(*) AS count
            FROM master_rt
            WHERE rw_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return parseInt(rows[0].count, 10) > 0;
    }
};

module.exports = RW;
