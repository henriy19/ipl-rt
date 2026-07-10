const crypto = require('crypto');
const Role = require('../models/roleModel');

const GetAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.getAll();
        return res.success('Berhasil mengambil data peran (roles)', roles);
    } catch (error) {
        next(error);
    }
};

const GetRoleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = await Role.getById(id);
        if (!role) {
            return res.error('Role tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail role', role);
    } catch (error) {
        next(error);
    }
};

const CreateRole = async (req, res, next) => {
    try {
        const { nama_role } = req.body;
        
        if (!nama_role) {
            return res.error('Nama role wajib diisi', 400);
        }

        const id = crypto.randomUUID();
        const roleData = {
            id,
            nama_role
        };

        await Role.create(roleData);
        const createdRole = await Role.getById(id);
        return res.success('Role berhasil ditambahkan', createdRole, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama_role } = req.body;

        const existingRole = await Role.getById(id);
        if (!existingRole) {
            return res.error('Role tidak ditemukan', 404);
        }

        if (!nama_role) {
            return res.error('Nama role wajib diisi', 400);
        }

        await Role.update(id, { nama_role });
        const updatedRole = await Role.getById(id);
        return res.success('Role berhasil diperbarui', updatedRole);
    } catch (error) {
        next(error);
    }
};

const DeleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const existingRole = await Role.getById(id);
        if (!existingRole) {
            return res.error('Role tidak ditemukan', 404);
        }

        // TODO: Tambahkan pengecekan apakah role sedang digunakan oleh user, sebelum menghapus. 
        // Sementara kita hapus langsung
        await Role.delete(id);
        return res.success('Role berhasil dihapus');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllRoles,
    GetRoleById,
    CreateRole,
    UpdateRole,
    DeleteRole
};
