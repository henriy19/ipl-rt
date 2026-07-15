const pool = require('../config/db');

const RT = {
    // Get all RT with their RW details
    async getAll(showAll = false) {
        const query = `
            SELECT 
                rt.id, 
                rt.nomor_rt, 
                rt.ketua_rt, 
                rt.is_active, 
                rt.created_at,
                rt.updated_at,
                rw.id AS rw_id, 
                rw.nomor_rw, 
                rw.ketua_rw
            FROM master_rt rt
            JOIN master_rw rw ON rt.rw_id = rw.id
            ${showAll ? '' : 'WHERE rt.is_active = TRUE'}
            ORDER BY rw.nomor_rw ASC, rt.nomor_rt ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Get specific RT by ID
    async getById(id) {
        const query = `
            SELECT 
                rt.id, 
                rt.nomor_rt, 
                rt.ketua_rt, 
                rt.is_active, 
                rt.created_at,
                rt.updated_at,
                rw.id AS rw_id, 
                rw.nomor_rw, 
                rw.ketua_rw
            FROM master_rt rt
            JOIN master_rw rw ON rt.rw_id = rw.id
            WHERE rt.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Create new RT record
    async create(rtData) {
        const { id, rw_id, nomor_rt, ketua_rt, is_active } = rtData;
        const query = `
            INSERT INTO master_rt (id, rw_id, nomor_rt, ketua_rt, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, rw_id, nomor_rt, ketua_rt, is_active ?? true]);
        return rows[0];
    },

    // Update existing RT record
    async update(id, rtData) {
        const { rw_id, nomor_rt, ketua_rt, is_active } = rtData;
        const query = `
            UPDATE master_rt
            SET rw_id = $1, nomor_rt = $2, ketua_rt = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;
        const { rows } = await pool.query(query, [rw_id, nomor_rt, ketua_rt, is_active, id]);
        return rows[0];
    },

    // Delete RT record
    async delete(id) {
        const query = `
            DELETE FROM master_rt
            WHERE id = $1
        `;
        await pool.query(query, [id]);
        return true;
    },

    // Check if RT is associated with any residents (users)
    async hasAssociatedUsers(id) {
        const query = `
            SELECT COUNT(*) AS count
            FROM users
            WHERE rt_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return parseInt(rows[0].count, 10) > 0;
    }
};

module.exports = RT;
