const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const User = require('../models/userModel');
const Penghuni = require('../models/penghuniModel');

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
            tanggal_lahir,
            penghuni_list,
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

        const additionalPenghuni = Array.isArray(penghuni_list) ? penghuni_list : [];
        const initialCount = 1 + additionalPenghuni.filter(p => p && p.nama_lengkap && p.nama_lengkap.trim() !== '').length;

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
            jumlah_penghuni: initialCount,
            tanggal_lahir: tanggal_lahir || null,
            is_active
        };

        await User.create(userData);

        // Sync detail penghuni di tabel users_penghuni
        await Penghuni.syncPenghuni(no_hp, { nama_lengkap, tanggal_lahir }, additionalPenghuni);

        // Ambil data warga yang baru dibuat (dengan detail penghuni)
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
            tanggal_lahir,
            penghuni_list,
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

        const additionalPenghuni = Array.isArray(penghuni_list) ? penghuni_list : (existingWarga.penghuni_list || []);
        const computedCount = 1 + additionalPenghuni.filter(p => p && p.nama_lengkap && p.nama_lengkap.trim() !== '').length;

        const userData = {
            role_id: role_id || existingWarga.role_id,
            nama_lengkap,
            no_hp,
            blok_rumah,
            nomor_rumah,
            status_hunian: status_hunian || existingWarga.status_hunian,
            rt_id,
            jumlah_penghuni: computedCount,
            tanggal_lahir: tanggal_lahir || existingWarga.tanggal_lahir || null,
            is_active: is_active !== undefined ? is_active : existingWarga.is_active
        };

        await User.update(id, userData);

        // Sync detail penghuni di tabel users_penghuni
        await Penghuni.syncPenghuni(no_hp, { nama_lengkap, tanggal_lahir }, additionalPenghuni);

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

const UploadExcelWarga = async (req, res, next) => {
    try {
        const { file } = req.body;
        if (!file) {
            return res.error('Berkas Excel wajib diunggah', 400);
        }

        const parts = file.split(';base64,');
        const base64Data = parts[1] || parts[0];
        const buffer = Buffer.from(base64Data, 'base64');

        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return res.error('Berkas Excel kosong atau tidak valid', 400);
        }
        const worksheet = workbook.Sheets[sheetName];
        const rowsData = XLSX.utils.sheet_to_json(worksheet);

        if (rowsData.length === 0) {
            return res.error('Tidak ada data dalam berkas Excel', 400);
        }

        const pool = require('../config/db');
        const { rows: roles } = await pool.query('SELECT id, nama_role FROM roles');
        const { rows: rts } = await pool.query(`
            SELECT rt.id, rt.nomor_rt, rw.nomor_rw 
            FROM master_rt rt 
            JOIN master_rw rw ON rt.rw_id = rw.id
        `);

        const roleMap = {};
        roles.forEach(r => {
            roleMap[r.nama_role.toLowerCase().trim()] = r.id;
        });

        const rtMap = {};
        rts.forEach(rt => {
            const rtPad = String(rt.nomor_rt || '').trim().padStart(3, '0');
            const rwPad = String(rt.nomor_rw || '').trim().padStart(3, '0');
            rtMap[`${rtPad}-${rwPad}`] = rt.id;
            if (!rtMap[rtPad]) {
                rtMap[rtPad] = rt.id;
            }
        });

        const defaultRoleId = roleMap['warga'] || '22222222-2222-2222-2222-222222222222';
        const password_hash = await bcrypt.hash('password123', 10);

        let upsertedCount = 0;
        await pool.query('BEGIN');

        for (const row of rowsData) {
            const nama_lengkap = row['Nama Lengkap'] || row['nama_lengkap'] || row['Nama'] || row['nama'];
            const no_hp = String(row['No HP'] || row['no_hp'] || row['Nomor HP'] || row['no_handphone'] || '').trim();
            const blok_rumah = row['Blok'] || row['blok'] || row['Blok Rumah'] || row['blok_rumah'];
            const nomor_rumah = String(row['No Rumah'] || row['no_rumah'] || row['Nomor Rumah'] || row['nomor_rumah'] || '').trim();
            const tanggal_lahir = row['Tanggal Lahir'] || row['tanggal_lahir'] || row['Tgl Lahir'] || null;

            let status_hunian = String(row['Status Hunian'] || row['status_hunian'] || row['Status'] || row['status'] || 'pemilik').toLowerCase().trim();
            if (status_hunian !== 'pemilik' && status_hunian !== 'penyewa') {
                status_hunian = 'pemilik';
            }

            const roleName = String(row['Peran'] || row['peran'] || row['Role'] || row['role'] || 'warga').toLowerCase().trim();
            const role_id = roleMap[roleName] || defaultRoleId;

            const rtInput = String(row['RT'] || row['rt'] || '').trim();
            const rwInput = String(row['RW'] || row['rw'] || '').trim();
            
            let rt_id = null;
            if (rtInput) {
                const rtPad = rtInput.padStart(3, '0');
                if (rwInput) {
                    const rwPad = rwInput.padStart(3, '0');
                    rt_id = rtMap[`${rtPad}-${rwPad}`] || rtMap[rtPad] || null;
                } else {
                    rt_id = rtMap[rtPad] || null;
                }
            }

            if (!nama_lengkap || !no_hp) {
                await pool.query('ROLLBACK');
                return res.error(`Baris data dengan Nama "${nama_lengkap || ''}" atau No HP "${no_hp || ''}" tidak valid. Nama Lengkap dan No HP wajib diisi.`, 400);
            }

            const newId = crypto.randomUUID();

            const query = `
                INSERT INTO users (
                    id, role_id, nama_lengkap, no_hp, password_hash, 
                    blok_rumah, nomor_rumah, status_hunian, rt_id, 
                    jumlah_penghuni, tanggal_lahir, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10, true)
                ON CONFLICT (no_hp) DO UPDATE SET
                    role_id = EXCLUDED.role_id,
                    nama_lengkap = EXCLUDED.nama_lengkap,
                    blok_rumah = EXCLUDED.blok_rumah,
                    nomor_rumah = EXCLUDED.nomor_rumah,
                    status_hunian = EXCLUDED.status_hunian,
                    rt_id = EXCLUDED.rt_id,
                    tanggal_lahir = EXCLUDED.tanggal_lahir,
                    is_active = EXCLUDED.is_active,
                    updated_at = CURRENT_TIMESTAMP
            `;

            const params = [
                newId,
                role_id,
                nama_lengkap,
                no_hp,
                password_hash,
                blok_rumah || null,
                nomor_rumah || null,
                status_hunian,
                rt_id,
                tanggal_lahir || null
            ];

            await pool.query(query, params);

            // Sync main user entry into users_penghuni
            await Penghuni.syncPenghuni(no_hp, { nama_lengkap, tanggal_lahir }, [], pool);

            upsertedCount++;
        }

        await pool.query('COMMIT');
        return res.success(`Berhasil mengunggah berkas Excel dan melakukan upsert pada ${upsertedCount} data warga.`, { upsertedCount });
    } catch (error) {
        try {
            const pool = require('../config/db');
            await pool.query('ROLLBACK');
        } catch (e) {
            console.error('Error during rollback:', e);
        }
        next(error);
    }
};

module.exports = {
    GetAllWarga,
    GetWargaById,
    CreateWarga,
    UpdateWarga,
    DeleteWarga,
    UploadExcelWarga
};
