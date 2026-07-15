const RT = require('../models/rtModel');
const RW = require('../models/rwModel');
const crypto = require('crypto');

const GetAllRT = async (req, res, next) => {
    try {
        const showAll = req.query.all === 'true';
        const rtList = await RT.getAll(showAll);
        return res.success('Berhasil mengambil data Rukun Tetangga (RT)', rtList);
    } catch (error) {
        next(error);
    }
};

const GetRTById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rt = await RT.getById(id);
        if (!rt) {
            return res.error('Data Rukun Tetangga (RT) tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail RT', rt);
    } catch (error) {
        next(error);
    }
};

const CreateRT = async (req, res, next) => {
    try {
        const { rw_id, nomor_rt, ketua_rt, is_active } = req.body;

        if (!rw_id) {
            return res.error('Rukun Warga (RW) penaung wajib dipilih', 400);
        }

        if (!nomor_rt) {
            return res.error('Nomor RT wajib diisi', 400);
        }

        if (nomor_rt.length > 5) {
            return res.error('Nomor RT maksimal 5 karakter', 400);
        }

        // Cek apakah RW penaung valid
        const rwExist = await RW.getById(rw_id);
        if (!rwExist) {
            return res.error('Data Rukun Warga (RW) penaung tidak valid', 400);
        }

        // Cek duplikasi nomor RT dalam RW yang sama
        const allRT = await RT.getAll(true);
        const isDuplicate = allRT.some(rt => rt.nomor_rt === nomor_rt && rt.rw_id === rw_id);
        if (isDuplicate) {
            return res.error(`Nomor RT ${nomor_rt} sudah terdaftar pada RW ${rwExist.nomor_rw}`, 400);
        }

        const id = crypto.randomUUID();
        const newRT = await RT.create({
            id,
            rw_id,
            nomor_rt,
            ketua_rt: ketua_rt || '',
            is_active: is_active !== undefined ? is_active : true
        });

        // Ambil detail RT baru untuk mengembalikan informasi RW lengkap
        const rtDetail = await RT.getById(id);
        return res.success('Berhasil menambahkan Rukun Tetangga (RT) baru', rtDetail, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateRT = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rw_id, nomor_rt, ketua_rt, is_active } = req.body;

        const rtExist = await RT.getById(id);
        if (!rtExist) {
            return res.error('Data Rukun Tetangga (RT) tidak ditemukan', 404);
        }

        if (!rw_id) {
            return res.error('Rukun Warga (RW) penaung wajib dipilih', 400);
        }

        if (!nomor_rt) {
            return res.error('Nomor RT wajib diisi', 400);
        }

        if (nomor_rt.length > 5) {
            return res.error('Nomor RT maksimal 5 karakter', 400);
        }

        // Cek apakah RW penaung valid
        const rwExist = await RW.getById(rw_id);
        if (!rwExist) {
            return res.error('Data Rukun Warga (RW) penaung tidak valid', 400);
        }

        // Cek duplikasi nomor RT dalam RW yang sama (kecuali dirinya sendiri)
        const allRT = await RT.getAll(true);
        const isDuplicate = allRT.some(rt => rt.nomor_rt === nomor_rt && rt.rw_id === rw_id && rt.id !== id);
        if (isDuplicate) {
            return res.error(`Nomor RT ${nomor_rt} sudah terdaftar pada RW ${rwExist.nomor_rw}`, 400);
        }

        await RT.update(id, {
            rw_id,
            nomor_rt,
            ketua_rt: ketua_rt || '',
            is_active: is_active !== undefined ? is_active : true
        });

        const rtDetail = await RT.getById(id);
        return res.success('Berhasil memperbarui data Rukun Tetangga (RT)', rtDetail);
    } catch (error) {
        next(error);
    }
};

const DeleteRT = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rtExist = await RT.getById(id);
        if (!rtExist) {
            return res.error('Data Rukun Tetangga (RT) tidak ditemukan', 404);
        }

        // Cek relasi ke tabel users
        const hasUsers = await RT.hasAssociatedUsers(id);
        if (hasUsers) {
            return res.error('Tidak dapat menghapus RT ini karena masih memiliki warga/user yang terdaftar di dalamnya', 400);
        }

        await RT.delete(id);
        return res.success('Berhasil menghapus data Rukun Tetangga (RT)');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllRT,
    GetRTById,
    CreateRT,
    UpdateRT,
    DeleteRT
};
