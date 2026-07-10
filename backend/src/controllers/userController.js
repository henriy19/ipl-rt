const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const GetAllWarga = async (req, res, next) => {
    try {
        const warga = await User.getAll();
        return res.success('Berhasil mengambil semua data warga', warga);
    } catch (error) {
        next(error);
    }
};

const GetWargaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const warga = await User.getById(id);
        if (!warga) {
            return res.error('Warga tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail warga', warga);
    } catch (error) {
        next(error);
    }
};

const CreateWarga = async (req, res, next) => {
    try {
        const { 
            role_id, 
            nama_lengkap, 
            no_hp, 
            password, 
            blok_rumah, 
            nomor_rumah, 
            status_hunian, 
            rt_id, 
            is_active 
        } = req.body;

        // Validasi field wajib
        if (!nama_lengkap || !no_hp) {
            return res.error('Nama lengkap dan Nomor HP wajib diisi', 400);
        }

        // Cek apakah nomor HP sudah terdaftar
        const existingUser = await User.getByPhone(no_hp);
        if (existingUser) {
            return res.error('Nomor HP sudah terdaftar', 400);
        }

        // Generate UUID untuk warga baru
        const id = crypto.randomUUID();

        // Default role: Warga ('22222222-2222-2222-2222-222222222222') jika tidak dispesifikasikan
        const finalRoleId = role_id || '22222222-2222-2222-2222-222222222222';

        // Set default password 'password123' jika tidak dispesifikasikan oleh admin
        const rawPassword = password || 'password123';
        const password_hash = await bcrypt.hash(rawPassword, 10);

        const userData = {
            id,
            role_id: finalRoleId,
            nama_lengkap,
            no_hp,
            password_hash,
            blok_rumah,
            nomor_rumah,
            status_hunian,
            rt_id,
            is_active
        };

        await User.create(userData);

        // Ambil data warga yang baru dibuat (tanpa password_hash)
        const createdWarga = await User.getById(id);

        return res.success('Warga berhasil ditambahkan', createdWarga, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateWarga = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            role_id, 
            nama_lengkap, 
            no_hp, 
            blok_rumah, 
            nomor_rumah, 
            status_hunian, 
            rt_id, 
            is_active 
        } = req.body;

        // Cek apakah warga ada
        const existingWarga = await User.getById(id);
        if (!existingWarga) {
            return res.error('Warga tidak ditemukan', 404);
        }

        // Validasi field wajib
        if (!nama_lengkap || !no_hp) {
            return res.error('Nama lengkap dan Nomor HP wajib diisi', 400);
        }

        // Cek jika nomor HP diubah dan sudah terpakai oleh user lain
        if (no_hp !== existingWarga.no_hp) {
            const userWithPhone = await User.getByPhone(no_hp);
            if (userWithPhone) {
                return res.error('Nomor HP sudah terdaftar pada user lain', 400);
            }
        }

        const userData = {
            role_id: role_id || existingWarga.role_id,
            nama_lengkap,
            no_hp,
            blok_rumah,
            nomor_rumah,
            status_hunian: status_hunian || existingWarga.status_hunian,
            rt_id,
            is_active: is_active !== undefined ? is_active : existingWarga.is_active
        };

        await User.update(id, userData);

        // Ambil data warga setelah diperbarui
        const updatedWarga = await User.getById(id);

        return res.success('Data warga berhasil diperbarui', updatedWarga);
    } catch (error) {
        next(error);
    }
};

const DeleteWarga = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingWarga = await User.getById(id);
        if (!existingWarga) {
            return res.error('Warga tidak ditemukan', 404);
        }

        await User.delete(id);
        return res.success('Warga berhasil dihapus');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllWarga,
    GetWargaById,
    CreateWarga,
    UpdateWarga,
    DeleteWarga
};
