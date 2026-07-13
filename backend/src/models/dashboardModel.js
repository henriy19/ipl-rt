const pool = require('../config/db');

const Dashboard = {
    // Get stats for admin
    async getAdminStats(bulan, tahun) {
        // 1. Get total warga
        const wargaQuery = `
            SELECT COUNT(*)::int AS count 
            FROM users 
            WHERE role_id = '22222222-2222-2222-2222-222222222222'
        `;
        const wargaRes = await pool.query(wargaQuery);
        const totalWarga = wargaRes.rows[0]?.count || 0;

        // 2. Get pemasukan bulan ini
        const pemasukanQuery = `
            SELECT COALESCE(SUM(nominal_tagihan), 0)::float AS total 
            FROM tagihan 
            WHERE status = 'paid' AND bulan = $1 AND tahun = $2
        `;
        const pemRes = await pool.query(pemasukanQuery, [bulan, tahun]);
        const pemasukanBulanIni = pemRes.rows[0]?.total || 0;

        // 3. Get total tunggakan (unpaid/pending all time)
        const tunggakanQuery = `
            SELECT COALESCE(SUM(nominal_tagihan), 0)::float AS total 
            FROM tagihan 
            WHERE status != 'paid'
        `;
        const tunggakanRes = await pool.query(tunggakanQuery);
        const totalTunggakan = tunggakanRes.rows[0]?.total || 0;

        // 4. Get latest 5 transactions
        const latestTxQuery = `
            SELECT 
                t.id AS tagihan_id,
                t.bulan,
                t.tahun,
                t.nominal_tagihan,
                t.status,
                u.nama_lengkap,
                u.blok_rumah,
                u.nomor_rumah,
                tp.tanggal_bayar,
                tp.metode_pembayaran
            FROM tagihan t
            JOIN users u ON t.user_id = u.id
            JOIN transaksi_pembayaran tp ON t.id = tp.tagihan_id
            ORDER BY tp.created_at DESC, tp.updated_at DESC
            LIMIT 5
        `;
        const txRes = await pool.query(latestTxQuery);

        return {
            total_warga: totalWarga,
            pemasukan_bulan_ini: pemasukanBulanIni,
            total_tunggakan: totalTunggakan,
            transaksi_terbaru: txRes.rows
        };
    },

    // Get stats for warga
    async getWargaStats(userId, bulan, tahun) {
        // 1. Get warga info
        const infoQuery = `
            SELECT status_hunian, blok_rumah, nomor_rumah 
            FROM users 
            WHERE id = $1
        `;
        const infoRes = await pool.query(infoQuery, [userId]);
        const statusHunian = infoRes.rows[0]?.status_hunian || 'pemilik';
        const alamat = infoRes.rows[0] 
            ? `Blok ${infoRes.rows[0].blok_rumah}/${infoRes.rows[0].nomor_rumah}`
            : '-';

        // 2. Get total iuran lunas (all time)
        const lunasQuery = `
            SELECT COALESCE(SUM(nominal_tagihan), 0)::float AS total 
            FROM tagihan 
            WHERE user_id = $1 AND status = 'paid'
        `;
        const lunasRes = await pool.query(lunasQuery, [userId]);
        const totalLunas = lunasRes.rows[0]?.total || 0;

        // 3. Get total tunggakan (unpaid/pending all time)
        const tunggakanQuery = `
            SELECT COALESCE(SUM(nominal_tagihan), 0)::float AS total 
            FROM tagihan 
            WHERE user_id = $1 AND status != 'paid'
        `;
        const tunggakanRes = await pool.query(tunggakanQuery, [userId]);
        const totalTunggakan = tunggakanRes.rows[0]?.total || 0;

        // 4. Get latest 5 transactions for this warga
        const latestTxQuery = `
            SELECT 
                t.id AS tagihan_id,
                t.bulan,
                t.tahun,
                t.nominal_tagihan,
                t.status,
                u.nama_lengkap,
                u.blok_rumah,
                u.nomor_rumah,
                tp.tanggal_bayar,
                tp.metode_pembayaran
            FROM tagihan t
            JOIN users u ON t.user_id = u.id
            JOIN transaksi_pembayaran tp ON t.id = tp.tagihan_id
            WHERE t.user_id = $1
            ORDER BY tp.created_at DESC, tp.updated_at DESC
            LIMIT 5
        `;
        const txRes = await pool.query(latestTxQuery, [userId]);

        return {
            status_hunian: statusHunian,
            alamat: alamat,
            total_lunas: totalLunas,
            total_tunggakan: totalTunggakan,
            transaksi_terbaru: txRes.rows
        };
    }
};

module.exports = Dashboard;
