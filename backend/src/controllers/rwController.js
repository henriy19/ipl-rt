const RW = require('../models/rwModel');
const crypto = require('crypto');

const GetAllRW = async (req, res, next) => {
    try {
        const rwList = await RW.getAll();
        return res.success('Berhasil mengambil data Rukun Warga (RW)', rwList);
    } catch (error) {
        next(error);
    }
};

const GetRWById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rw = await RW.getById(id);
        if (!rw) {
            return res.error('Data Rukun Warga (RW) tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail RW', rw);
    } catch (error) {
        next(error);
    }
};

const CreateRW = async (req, res, next) => {
    try {
        const { nomor_rw, ketua_rw, is_active } = req.body;

        if (!nomor_rw) {
            return res.error('Nomor RW wajib diisi', 400);
        }

        if (nomor_rw.length > 5) {
            return res.error('Nomor RW maksimal 5 karakter', 400);
        }

        // Cek duplikasi nomor RW
        const allRW = await RW.getAll();
        const isDuplicate = allRW.some(rw => rw.nomor_rw === nomor_rw);
        if (isDuplicate) {
            return res.error(`Nomor RW ${nomor_rw} sudah terdaftar`, 400);
        }

        const id = crypto.randomUUID();
        const newRW = await RW.create({
            id,
            nomor_rw,
            ketua_rw: ketua_rw || '',
            is_active: is_active !== undefined ? is_active : true
        });

        return res.success('Berhasil menambahkan Rukun Warga (RW) baru', newRW, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateRW = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nomor_rw, ketua_rw, is_active } = req.body;

        const rwExist = await RW.getById(id);
        if (!rwExist) {
            return res.error('Data Rukun Warga (RW) tidak ditemukan', 404);
        }

        if (!nomor_rw) {
            return res.error('Nomor RW wajib diisi', 400);
        }

        if (nomor_rw.length > 5) {
            return res.error('Nomor RW maksimal 5 karakter', 400);
        }

        // Cek duplikasi nomor RW (kecuali untuk dirinya sendiri)
        const allRW = await RW.getAll();
        const isDuplicate = allRW.some(rw => rw.nomor_rw === nomor_rw && rw.id !== id);
        if (isDuplicate) {
            return res.error(`Nomor RW ${nomor_rw} sudah digunakan oleh RW lain`, 400);
        }

        const updatedRW = await RW.update(id, {
            nomor_rw,
            ketua_rw: ketua_rw || '',
            is_active: is_active !== undefined ? is_active : true
        });

        return res.success('Berhasil memperbarui data Rukun Warga (RW)', updatedRW);
    } catch (error) {
        next(error);
    }
};

const DeleteRW = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rwExist = await RW.getById(id);
        if (!rwExist) {
            return res.error('Data Rukun Warga (RW) tidak ditemukan', 404);
        }

        // Cek relasi ke master_rt
        const hasRT = await RW.hasAssociatedRT(id);
        if (hasRT) {
            return res.error('Tidak dapat menghapus RW ini karena masih memiliki RT yang terhubung', 400);
        }

        await RW.delete(id);
        return res.success('Berhasil menghapus data Rukun Warga (RW)');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllRW,
    GetRWById,
    CreateRW,
    UpdateRW,
    DeleteRW
};
