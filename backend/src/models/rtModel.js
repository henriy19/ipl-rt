const pool = require('../config/db');

const RT = {
    // Get all RT with their RW details
    async getAll() {
        const query = `
            SELECT 
                rt.id, 
                rt.nomor_rt, 
                rt.ketua_rt, 
                rt.is_active, 
                rw.id AS rw_id, 
                rw.nomor_rw, 
                rw.ketua_rw
            FROM master_rt rt
            JOIN master_rw rw ON rt.rw_id = rw.id
            WHERE rt.is_active = TRUE
            ORDER BY rw.nomor_rw ASC, rt.nomor_rt ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = RT;
