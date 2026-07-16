const Struktur = require('../models/strukturModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const RT = require('../models/rtModel');
const crypto = require('crypto');

const GetAllStruktur = async (req, res, next) => {
    try {
        const list = await Struktur.getAll();
        return res.success('Berhasil mengambil struktur organisasi', list);
    } catch (error) {
        next(error);
    }
};

const GetStrukturById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pengurus = await Struktur.getById(id);
        if (!pengurus) {
            return res.error('Pengurus tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail pengurus', pengurus);
    } catch (error) {
        next(error);
    }
};

const CreateStruktur = async (req, res, next) => {
    try {
        const { user_id, role_id, rt_id, is_active } = req.body;

        if (!user_id) {
            return res.error('Warga pengurus wajib dipilih', 400);
        }
        if (!role_id) {
            return res.error('Jabatan (Role) wajib dipilih', 400);
        }

        // Cek apakah user exist
        const userExist = await User.getById(user_id);
        if (!userExist) {
            return res.error('Warga yang dipilih tidak ditemukan', 400);
        }

        // Cek apakah role exist
        const roleExist = await Role.getById(role_id);
        if (!roleExist) {
            return res.error('Jabatan (Role) yang dipilih tidak ditemukan', 400);
        }

        // Cek apakah RT exist (jika dipilih)
        if (rt_id) {
            const rtExist = await RT.getById(rt_id);
            if (!rtExist) {
                return res.error('RT penugasan tidak ditemukan', 400);
            }
        }

        // Cek duplikasi
        const duplicate = await Struktur.getByUserId(user_id);
        if (duplicate) {
            return res.error(`Warga ${userExist.nama_lengkap} sudah terdaftar dalam struktur organisasi`, 400);
        }

        const id = crypto.randomUUID();
        await Struktur.create({
            id,
            user_id,
            role_id,
            rt_id: rt_id || null,
            is_active: is_active !== undefined ? is_active : true
        });

        const newPengurus = await Struktur.getById(id);
        return res.success('Berhasil menambahkan pengurus baru', newPengurus, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateStruktur = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role_id, rt_id, is_active } = req.body;

        const pengurusExist = await Struktur.getById(id);
        if (!pengurusExist) {
            return res.error('Pengurus tidak ditemukan', 404);
        }

        if (!role_id) {
            return res.error('Jabatan (Role) wajib dipilih', 400);
        }

        // Cek apakah role exist
        const roleExist = await Role.getById(role_id);
        if (!roleExist) {
            return res.error('Jabatan (Role) yang dipilih tidak ditemukan', 400);
        }

        // Cek apakah RT exist (jika dipilih)
        if (rt_id) {
            const rtExist = await RT.getById(rt_id);
            if (!rtExist) {
                return res.error('RT penugasan tidak ditemukan', 400);
            }
        }

        await Struktur.update(id, {
            role_id,
            rt_id: rt_id || null,
            is_active: is_active !== undefined ? is_active : true
        });

        const detailUpdated = await Struktur.getById(id);
        return res.success('Berhasil memperbarui data pengurus', detailUpdated);
    } catch (error) {
        next(error);
    }
};

const DeleteStruktur = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pengurusExist = await Struktur.getById(id);
        if (!pengurusExist) {
            return res.error('Pengurus tidak ditemukan', 404);
        }

        await Struktur.delete(id);
        return res.success('Berhasil menghapus pengurus dari struktur organisasi');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllStruktur,
    GetStrukturById,
    CreateStruktur,
    UpdateStruktur,
    DeleteStruktur
};
