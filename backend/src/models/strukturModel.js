const pool = require('../config/db');

const Struktur = {
    // Get all struktur kepengurusan with user, role & RT details
    async getAll() {
        const query = `
            SELECT 
                s.id, 
                s.user_id, 
                s.role_id, 
                s.rt_id,
                s.is_active, 
                s.created_at, 
                s.updated_at,
                u.nama_lengkap, 
                u.no_hp, 
                u.blok_rumah, 
                u.nomor_rumah,
                r.nama_role AS jabatan,
                rt.nomor_rt,
                rw.nomor_rw
            FROM master_struktur s
            JOIN users u ON s.user_id = u.id
            JOIN roles r ON s.role_id = r.id
            LEFT JOIN master_rt rt ON s.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            ORDER BY r.nama_role ASC, u.nama_lengkap ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Get specific pengurus by ID
    async getById(id) {
        const query = `
            SELECT 
                s.id, 
                s.user_id, 
                s.role_id, 
                s.rt_id,
                s.is_active, 
                s.created_at, 
                s.updated_at,
                u.nama_lengkap, 
                u.no_hp, 
                u.blok_rumah, 
                u.nomor_rumah,
                r.nama_role AS jabatan,
                rt.nomor_rt,
                rw.nomor_rw
            FROM master_struktur s
            JOIN users u ON s.user_id = u.id
            JOIN roles r ON s.role_id = r.id
            LEFT JOIN master_rt rt ON s.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            WHERE s.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Get pengurus by user ID
    async getByUserId(userId) {
        const query = `
            SELECT id, user_id, role_id, rt_id, is_active, created_at, updated_at
            FROM master_struktur
            WHERE user_id = $1
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows[0] || null;
    },

    // Create new pengurus
    async create(data) {
        const { id, user_id, role_id, rt_id, is_active } = data;
        const query = `
            INSERT INTO master_struktur (id, user_id, role_id, rt_id, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, user_id, role_id, rt_id || null, is_active ?? true]);
        return rows[0];
    },

    // Update existing pengurus
    async update(id, data) {
        const { role_id, rt_id, is_active } = data;
        const query = `
            UPDATE master_struktur
            SET role_id = $1, rt_id = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const { rows } = await pool.query(query, [role_id, rt_id || null, is_active, id]);
        return rows[0];
    },

    // Delete pengurus
    async delete(id) {
        const query = `
            DELETE FROM master_struktur
            WHERE id = $1
        `;
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = Struktur;
