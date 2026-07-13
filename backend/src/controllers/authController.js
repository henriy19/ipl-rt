const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
    try {
        const { no_hp, password } = req.body;

        if (!no_hp || !password) {
            return res.status(400).json({ message: 'Nomor HP dan Password wajib diisi' });
        }

        // Cari user berdasarkan no_hp
        const { rows: users } = await pool.query(`
            SELECT u.*, r.nama_role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.no_hp = $1 AND u.is_active = TRUE
        `, [no_hp]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Kredensial tidak valid atau akun tidak aktif' });
        }

        const user = users[0];

        // Validasi password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Kredensial tidak valid' });
        }

        // Ambil daftar akses menu untuk role user
        const { rows: menus } = await pool.query(`
            SELECT m.path_url 
            FROM role_menus rm
            JOIN menus m ON rm.menu_id = m.id
            WHERE rm.role_id = $1 AND m.is_active = TRUE
        `, [user.role_id]);

        const allowedPaths = menus.map(m => m.path_url);

        // Buat JWT Token
        const payload = {
            id: user.id,
            role_id: user.role_id,
            nama_role: user.nama_role,
            nama_lengkap: user.nama_lengkap,
            rt_id: user.rt_id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login berhasil',
            token,
            user: payload,
            allowed_paths: allowedPaths
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = {
    login
};
