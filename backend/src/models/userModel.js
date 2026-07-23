const pool = require('../config/db');
const Penghuni = require('./penghuniModel');

const User = {
    // Get all users with roles, RT/RW details, and occupant counts
    async getAll() {
        const query = `
            SELECT 
                u.id, 
                u.nama_lengkap, 
                u.no_hp, 
                TO_CHAR(u.tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir,
                u.blok_rumah, 
                u.nomor_rumah, 
                u.status_hunian, 
                u.jumlah_penghuni,
                u.is_active, 
                u.created_at, 
                u.updated_at,
                r.id AS role_id,
                r.nama_role,
                rt.id AS rt_id,
                rt.nomor_rt,
                rw.id AS rw_id,
                rw.nomor_rw
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN master_rt rt ON u.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            ORDER BY u.created_at DESC
        `;
        const { rows } = await pool.query(query);

        // Fetch occupant details for all users in bulk
        const phones = rows.map(r => r.no_hp).filter(Boolean);
        const penghuniMap = await Penghuni.getByPhonesBulk(phones);

        return rows.map(r => ({
            ...r,
            penghuni_list: penghuniMap[r.no_hp] || []
        }));
    },

    // Find a user by their ID with detail penghuni
    async getById(id) {
        const query = `
            SELECT 
                u.id, 
                u.nama_lengkap, 
                u.no_hp, 
                TO_CHAR(u.tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir,
                u.blok_rumah, 
                u.nomor_rumah, 
                u.status_hunian, 
                u.jumlah_penghuni,
                u.is_active, 
                u.created_at, 
                u.updated_at,
                r.id AS role_id,
                r.nama_role,
                rt.id AS rt_id,
                rt.nomor_rt,
                rw.id AS rw_id,
                rw.nomor_rw
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN master_rt rt ON u.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            WHERE u.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        if (!rows[0]) return null;

        const user = rows[0];
        user.penghuni_list = await Penghuni.getByPhone(user.no_hp);
        return user;
    },

    // Find a user by phone number
    async getByPhone(no_hp) {
        const query = `
            SELECT id, role_id, nama_lengkap, no_hp, password_hash, blok_rumah, nomor_rumah, status_hunian, rt_id, jumlah_penghuni, TO_CHAR(tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir, is_active, created_at, updated_at 
            FROM users 
            WHERE no_hp = $1
        `;
        const { rows } = await pool.query(query, [no_hp]);
        return rows[0] || null;
    },

    // Create a new user
    async create(userData) {
        const query = `
            INSERT INTO users (
                id, 
                role_id, 
                nama_lengkap, 
                no_hp, 
                password_hash, 
                blok_rumah, 
                nomor_rumah, 
                status_hunian, 
                rt_id, 
                jumlah_penghuni,
                tanggal_lahir,
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        const params = [
            userData.id,
            userData.role_id,
            userData.nama_lengkap,
            userData.no_hp,
            userData.password_hash,
            userData.blok_rumah || null,
            userData.nomor_rumah || null,
            userData.status_hunian || 'pemilik',
            userData.rt_id || null,
            userData.jumlah_penghuni !== undefined ? parseInt(userData.jumlah_penghuni, 10) : 1,
            userData.tanggal_lahir || null,
            userData.is_active !== undefined ? userData.is_active : true
        ];
        const { rowCount } = await pool.query(query, params);
        return { affectedRows: rowCount };
    },

    // Update a user
    async update(id, userData) {
        const query = `
            UPDATE users SET 
                role_id = $1, 
                nama_lengkap = $2, 
                no_hp = $3, 
                blok_rumah = $4, 
                nomor_rumah = $5, 
                status_hunian = $6, 
                rt_id = $7, 
                jumlah_penghuni = $8,
                tanggal_lahir = $9,
                is_active = $10
            WHERE id = $11
        `;
        const params = [
            userData.role_id,
            userData.nama_lengkap,
            userData.no_hp,
            userData.blok_rumah || null,
            userData.nomor_rumah || null,
            userData.status_hunian,
            userData.rt_id || null,
            userData.jumlah_penghuni !== undefined ? parseInt(userData.jumlah_penghuni, 10) : 1,
            userData.tanggal_lahir || null,
            userData.is_active !== undefined ? userData.is_active : true,
            id
        ];
        const { rowCount } = await pool.query(query, params);
        return { affectedRows: rowCount };
    },

    // Delete a user
    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1';
        const { rowCount } = await pool.query(query, [id]);
        return { affectedRows: rowCount };
    }
};

module.exports = User;
