const pool = require('../config/db');

const Role = {
    // Get all roles
    async getAll() {
        const query = 'SELECT id, nama_role, created_at, updated_at FROM roles ORDER BY nama_role ASC';
        const [rows] = await pool.query(query);
        return rows;
    },

    // Get role by ID
    async getById(id) {
        const query = 'SELECT id, nama_role, created_at, updated_at FROM roles WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    },

    // Create a new role
    async create(roleData) {
        const { id, nama_role } = roleData;
        const query = 'INSERT INTO roles (id, nama_role) VALUES (?, ?)';
        const [result] = await pool.query(query, [id, nama_role]);
        return result;
    },

    // Update a role
    async update(id, roleData) {
        const { nama_role } = roleData;
        const query = 'UPDATE roles SET nama_role = ? WHERE id = ?';
        const [result] = await pool.query(query, [nama_role, id]);
        return result;
    },

    // Delete a role
    async delete(id) {
        const query = 'DELETE FROM roles WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result;
    }
};

module.exports = Role;
