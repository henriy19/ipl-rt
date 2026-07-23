const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const pool = require('../backend/src/config/db');
const Penghuni = require('../backend/src/models/penghuniModel');
const User = require('../backend/src/models/userModel');

async function testUserUpdate() {
    try {
        console.log('Fetching users...');
        const users = await User.getAll();
        console.log('Total users fetched:', users.length);

        if (users.length > 0) {
            const targetUser = users[0];
            console.log('Target user before update:', targetUser.nama_lengkap, 'Penghuni count:', targetUser.jumlah_penghuni, 'List:', targetUser.penghuni_list);

            console.log('Simulating update with additional occupant...');
            const additionalPenghuni = [
                { nama_lengkap: 'Ny.' + targetUser.nama_lengkap, tanggal_lahir: '2000-07-18' }
            ];

            const computedCount = 1 + additionalPenghuni.length;
            await User.update(targetUser.id, {
                role_id: targetUser.role_id,
                nama_lengkap: targetUser.nama_lengkap,
                no_hp: targetUser.no_hp,
                blok_rumah: targetUser.blok_rumah,
                nomor_rumah: targetUser.nomor_rumah,
                status_hunian: targetUser.status_hunian,
                rt_id: targetUser.rt_id,
                jumlah_penghuni: computedCount,
                tanggal_lahir: targetUser.tanggal_lahir,
                is_active: targetUser.is_active
            });

            await Penghuni.syncPenghuni(targetUser.no_hp, {
                nama_lengkap: targetUser.nama_lengkap,
                tanggal_lahir: targetUser.tanggal_lahir
            }, additionalPenghuni);

            const updatedUser = await User.getById(targetUser.id);
            console.log('Target user AFTER update:', updatedUser.nama_lengkap, 'Penghuni count:', updatedUser.jumlah_penghuni, 'List:', updatedUser.penghuni_list);
        }
    } catch (err) {
        console.error('TEST ERROR:', err);
    } finally {
        await pool.end();
    }
}

testUserUpdate();
