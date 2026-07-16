const pool = require('../config/db');

const Petugas = {
    // Get all petugas with user & address details
    async getAll() {
        const query = `
            SELECT 
                p.id, 
                p.user_id, 
                p.jabatan, 
                p.is_active, 
                p.created_at, 
                p.updated_at,
                u.nama_lengkap, 
                u.no_hp, 
                u.blok_rumah, 
                u.nomor_rumah,
                u.rt_id,
                rt.nomor_rt,
                rw.nomor_rw
            FROM master_petugas p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN master_rt rt ON u.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            ORDER BY u.nama_lengkap ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Get specific petugas by ID
    async getById(id) {
        const query = `
            SELECT 
                p.id, 
                p.user_id, 
                p.jabatan, 
                p.is_active, 
                p.created_at, 
                p.updated_at,
                u.nama_lengkap, 
                u.no_hp, 
                u.blok_rumah, 
                u.nomor_rumah,
                u.rt_id,
                rt.nomor_rt,
                rw.nomor_rw
            FROM master_petugas p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN master_rt rt ON u.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            WHERE p.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Get petugas by user ID
    async getByUserId(userId) {
        const query = `
            SELECT id, user_id, jabatan, is_active, created_at, updated_at
            FROM master_petugas
            WHERE user_id = $1
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows[0] || null;
    },

    // Create new petugas
    async create(petugasData) {
        const { id, user_id, jabatan, is_active } = petugasData;
        const query = `
            INSERT INTO master_petugas (id, user_id, jabatan, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, user_id, jabatan, is_active ?? true]);
        return rows[0];
    },

    // Update existing petugas
    async update(id, petugasData) {
        const { jabatan, is_active } = petugasData;
        const query = `
            UPDATE master_petugas
            SET jabatan = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const { rows } = await pool.query(query, [jabatan, is_active, id]);
        return rows[0];
    },

    // Delete petugas
    async delete(id) {
        const query = `
            DELETE FROM master_petugas
            WHERE id = $1
        `;
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = Petugas;
