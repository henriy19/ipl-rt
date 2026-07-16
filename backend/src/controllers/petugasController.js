const Petugas = require('../models/petugasModel');
const User = require('../models/userModel');
const crypto = require('crypto');

const GetAllPetugas = async (req, res, next) => {
    try {
        const petugasList = await Petugas.getAll();
        return res.success('Berhasil mengambil daftar petugas', petugasList);
    } catch (error) {
        next(error);
    }
};

const GetPetugasById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const petugas = await Petugas.getById(id);
        if (!petugas) {
            return res.error('Data petugas tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail petugas', petugas);
    } catch (error) {
        next(error);
    }
};

const CreatePetugas = async (req, res, next) => {
    try {
        const { user_id, jabatan, is_active } = req.body;

        if (!user_id) {
            return res.error('Warga penunjuk wajib dipilih', 400);
        }

        if (!jabatan) {
            return res.error('Jabatan petugas wajib diisi', 400);
        }

        // Cek apakah user yang ditunjuk ada di database
        const userExist = await User.getById(user_id);
        if (!userExist) {
            return res.error('Warga yang dipilih tidak valid atau tidak ditemukan', 400);
        }

        // Cek apakah warga sudah didaftarkan sebagai petugas sebelumnya (Unique constraint)
        const duplicatePetugas = await Petugas.getByUserId(user_id);
        if (duplicatePetugas) {
            return res.error(`Warga ${userExist.nama_lengkap} sudah terdaftar sebagai petugas`, 400);
        }

        const id = crypto.randomUUID();
        await Petugas.create({
            id,
            user_id,
            jabatan,
            is_active: is_active !== undefined ? is_active : true
        });

        // Ambil detail petugas baru yang lengkap dengan join data warga
        const newPetugas = await Petugas.getById(id);
        return res.success('Berhasil menambahkan petugas baru', newPetugas, 201);
    } catch (error) {
        next(error);
    }
};

const UpdatePetugas = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { jabatan, is_active } = req.body;

        const petugasExist = await Petugas.getById(id);
        if (!petugasExist) {
            return res.error('Data petugas tidak ditemukan', 404);
        }

        if (!jabatan) {
            return res.error('Jabatan petugas wajib diisi', 400);
        }

        const updatedPetugas = await Petugas.update(id, {
            jabatan,
            is_active: is_active !== undefined ? is_active : true
        });

        const detailUpdated = await Petugas.getById(id);
        return res.success('Berhasil memperbarui data petugas', detailUpdated);
    } catch (error) {
        next(error);
    }
};

const DeletePetugas = async (req, res, next) => {
    try {
        const { id } = req.params;

        const petugasExist = await Petugas.getById(id);
        if (!petugasExist) {
            return res.error('Data petugas tidak ditemukan', 404);
        }

        await Petugas.delete(id);
        return res.success('Berhasil menghapus data petugas');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllPetugas,
    GetPetugasById,
    CreatePetugas,
    UpdatePetugas,
    DeletePetugas
};
