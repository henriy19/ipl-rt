const pool = require('../config/db');
const crypto = require('crypto');

const Tagihan = {
    // Get all bills with filters for Admin
    async getAll(filters = {}) {
        let query = `
            SELECT 
                t.id, 
                t.user_id, 
                t.master_iuran_id, 
                t.bulan, 
                t.tahun, 
                t.nominal_tagihan, 
                t.status, 
                t.created_at, 
                t.updated_at,
                u.nama_lengkap, 
                u.blok_rumah, 
                u.nomor_rumah, 
                u.no_hp,
                rt.nomor_rt,
                rw.nomor_rw,
                mi.nama_iuran,
                tp.tanggal_bayar,
                tp.metode_pembayaran,
                tp.catatan_bendahara,
                tp.bukti_pembayaran_url,
                tp.tanggal_verifikasi,
                v.nama_lengkap AS verifikator_nama
            FROM tagihan t
            JOIN users u ON t.user_id = u.id
            JOIN master_iuran mi ON t.master_iuran_id = mi.id
            LEFT JOIN master_rt rt ON u.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            LEFT JOIN transaksi_pembayaran tp ON t.id = tp.tagihan_id
            LEFT JOIN users v ON tp.diverifikasi_oleh = v.id
        `;
        
        const params = [];
        const conditions = [];

        if (filters.bulan !== undefined && filters.bulan !== '') {
            params.push(parseInt(filters.bulan, 10));
            conditions.push(`t.bulan = $${params.length}`);
        }
        if (filters.tahun !== undefined && filters.tahun !== '') {
            params.push(parseInt(filters.tahun, 10));
            conditions.push(`t.tahun = $${params.length}`);
        }
        if (filters.status !== undefined && filters.status !== '' && filters.status !== 'all') {
            params.push(filters.status);
            conditions.push(`t.status = $${params.length}`);
        }
        if (filters.user_id !== undefined && filters.user_id !== '') {
            params.push(filters.user_id);
            conditions.push(`t.user_id = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY t.tahun DESC, t.bulan DESC, u.nama_lengkap ASC`;

        const { rows } = await pool.query(query, params);
        return rows;
    },

    // Get bill history for specific resident
    async getByWargaId(userId) {
        const query = `
            SELECT 
                t.id, 
                t.bulan, 
                t.tahun, 
                t.nominal_tagihan, 
                t.status, 
                t.created_at, 
                mi.nama_iuran,
                tp.tanggal_bayar,
                tp.metode_pembayaran,
                tp.catatan_bendahara,
                tp.tanggal_verifikasi,
                v.nama_lengkap AS verifikator_nama
            FROM tagihan t
            JOIN master_iuran mi ON t.master_iuran_id = mi.id
            LEFT JOIN transaksi_pembayaran tp ON t.id = tp.tagihan_id
            LEFT JOIN users v ON tp.diverifikasi_oleh = v.id
            WHERE t.user_id = $1
            ORDER BY t.tahun DESC, t.bulan DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    // Get specific bill by ID
    async getById(id) {
        const query = 'SELECT * FROM tagihan WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Generate monthly bills for all active Warga
    async generateBulanan(bulan, tahun) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Get all active iuran
            const iuranRes = await client.query(`SELECT id, nominal FROM master_iuran WHERE is_active = true`);
            const activeIuran = iuranRes.rows;

            if (activeIuran.length === 0) {
                await client.query('ROLLBACK');
                return { count: 0, message: 'Tidak ada jenis iuran aktif untuk di-generate' };
            }

            // 2. Get all active Warga
            const wargaRes = await client.query(`
                SELECT u.id FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.is_active = true AND LOWER(r.nama_role) = 'warga'
            `);
            const activeWarga = wargaRes.rows;

            if (activeWarga.length === 0) {
                await client.query('ROLLBACK');
                return { count: 0, message: 'Tidak ada warga aktif untuk di-generate' };
            }

            // Check if bills already exist for the selected month/year
            const checkExistRes = await client.query(`
                SELECT COUNT(*) FROM tagihan WHERE bulan = $1 AND tahun = $2
            `, [bulan, tahun]);
            const existingCount = parseInt(checkExistRes.rows[0].count, 10);
            if (existingCount > 0) {
                await client.query('ROLLBACK');
                return { count: 0, message: `Tagihan untuk periode ${bulan}/${tahun} sudah pernah di-generate sebelumnya.` };
            }

            let generatedCount = 0;

            // 3. Insert bills if not already exists
            for (const warga of activeWarga) {
                for (const iuran of activeIuran) {
                    const checkRes = await client.query(`
                        SELECT id FROM tagihan 
                        WHERE user_id = $1 AND master_iuran_id = $2 AND bulan = $3 AND tahun = $4
                    `, [warga.id, iuran.id, bulan, tahun]);

                    if (checkRes.rows.length === 0) {
                        const tagihanId = crypto.randomUUID();
                        await client.query(`
                            INSERT INTO tagihan (id, user_id, master_iuran_id, bulan, tahun, nominal_tagihan, status)
                            VALUES ($1, $2, $3, $4, $5, $6, 'unpaid')
                        `, [tagihanId, warga.id, iuran.id, bulan, tahun, iuran.nominal]);
                        generatedCount++;
                    }
                }
            }

            await client.query('COMMIT');
            return { count: generatedCount };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Record payment for a bill
    async bayar(tagihanId, paymentData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if bill exists and is not already paid
            const tagihanRes = await client.query(`SELECT status FROM tagihan WHERE id = $1`, [tagihanId]);
            if (tagihanRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, message: 'Tagihan tidak ditemukan' };
            }
            if (tagihanRes.rows[0].status === 'paid') {
                await client.query('ROLLBACK');
                return { success: false, message: 'Tagihan sudah lunas' };
            }

            // Update bill status
            await client.query(`UPDATE tagihan SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [tagihanId]);

            // Insert payment transaction record
            const paymentId = crypto.randomUUID();
            const query = `
                INSERT INTO transaksi_pembayaran (
                    id, tagihan_id, tanggal_bayar, bukti_pembayaran_url, 
                    dicatat_oleh, diverifikasi_oleh, tanggal_verifikasi, 
                    catatan_bendahara, metode_pembayaran
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            const params = [
                paymentId,
                tagihanId,
                paymentData.tanggal_bayar || new Date(),
                paymentData.bukti_pembayaran_url || null,
                paymentData.dicatat_oleh,
                paymentData.diverifikasi_oleh,
                paymentData.tanggal_verifikasi || new Date(),
                paymentData.catatan_bendahara || null,
                paymentData.metode_pembayaran || 'cash'
            ];
            await client.query(query, params);

            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Tagihan;
