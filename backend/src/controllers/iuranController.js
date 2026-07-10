const crypto = require('crypto');
const Iuran = require('../models/iuranModel');

const GetAllIuran = async (req, res, next) => {
    try {
        const iuran = await Iuran.getAll();
        return res.success('Berhasil mengambil semua data iuran', iuran);
    } catch (error) {
        next(error);
    }
};

const GetIuranById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const iuran = await Iuran.getById(id);
        if (!iuran) {
            return res.error('Data iuran tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail iuran', iuran);
    } catch (error) {
        next(error);
    }
};

const CreateIuran = async (req, res, next) => {
    try {
        const { nama_iuran, nominal, is_active } = req.body;

        // Validasi field wajib
        if (!nama_iuran || nominal === undefined) {
            return res.error('Nama iuran dan Nominal wajib diisi', 400);
        }

        if (isNaN(nominal) || Number(nominal) < 0) {
            return res.error('Nominal harus berupa angka valid dan minimal 0', 400);
        }

        const id = crypto.randomUUID();
        const iuranData = {
            id,
            nama_iuran,
            nominal: Number(nominal),
            is_active
        };

        await Iuran.create(iuranData);

        const createdIuran = await Iuran.getById(id);
        return res.success('Iuran baru berhasil ditambahkan', createdIuran, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateIuran = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama_iuran, nominal, is_active } = req.body;

        const existingIuran = await Iuran.getById(id);
        if (!existingIuran) {
            return res.error('Data iuran tidak ditemukan', 404);
        }

        // Validasi
        if (!nama_iuran || nominal === undefined) {
            return res.error('Nama iuran dan Nominal wajib diisi', 400);
        }

        if (isNaN(nominal) || Number(nominal) < 0) {
            return res.error('Nominal harus berupa angka valid dan minimal 0', 400);
        }

        const iuranData = {
            nama_iuran,
            nominal: Number(nominal),
            is_active: is_active !== undefined ? is_active : existingIuran.is_active
        };

        await Iuran.update(id, iuranData);

        const updatedIuran = await Iuran.getById(id);
        return res.success('Data iuran berhasil diperbarui', updatedIuran);
    } catch (error) {
        next(error);
    }
};

const DeleteIuran = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingIuran = await Iuran.getById(id);
        if (!existingIuran) {
            return res.error('Data iuran tidak ditemukan', 404);
        }

        await Iuran.delete(id);
        return res.success('Data iuran berhasil dihapus');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllIuran,
    GetIuranById,
    CreateIuran,
    UpdateIuran,
    DeleteIuran
};
