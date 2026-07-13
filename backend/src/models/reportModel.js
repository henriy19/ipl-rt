const pool = require('../config/db');

const Report = {
    // Get aggregated paid monthly income for a year
    async getPemasukanBulanan(tahun) {
        const query = `
            SELECT 
                t.bulan, 
                SUM(t.nominal_tagihan) AS total
            FROM tagihan t
            WHERE t.tahun = $1 AND t.status = 'paid'
            GROUP BY t.bulan
            ORDER BY t.bulan ASC
        `;
        const { rows } = await pool.query(query, [tahun]);
        
        // Buat struktur default 12 bulan
        const rekapBulanan = Array.from({ length: 12 }, (_, i) => ({
            bulan: i + 1,
            total: 0
        }));

        // Isi data dari database
        rows.forEach(row => {
            const index = row.bulan - 1;
            if (index >= 0 && index < 12) {
                rekapBulanan[index].total = parseFloat(row.total) || 0;
            }
        });

        return rekapBulanan;
    },

    // Get list of unpaid warga (tunggakan) with filters
    async getTunggakanWarga(bulan, tahun) {
        let query = `
            SELECT 
                t.id AS tagihan_id,
                t.bulan,
                t.tahun,
                t.nominal_tagihan,
                u.nama_lengkap,
                u.blok_rumah,
                u.nomor_rumah,
                u.no_hp,
                rt.nomor_rt,
                rw.nomor_rw,
                mi.nama_iuran
            FROM tagihan t
            JOIN users u ON t.user_id = u.id
            JOIN master_iuran mi ON t.master_iuran_id = mi.id
            LEFT JOIN master_rt rt ON u.rt_id = rt.id
            LEFT JOIN master_rw rw ON rt.rw_id = rw.id
            WHERE t.status = 'unpaid'
        `;

        const params = [];
        
        if (bulan !== undefined && bulan !== '') {
            params.push(parseInt(bulan, 10));
            query += ` AND t.bulan = $${params.length}`;
        }
        if (tahun !== undefined && tahun !== '') {
            params.push(parseInt(tahun, 10));
            query += ` AND t.tahun = $${params.length}`;
        }

        query += ` ORDER BY t.tahun DESC, t.bulan DESC, u.nama_lengkap ASC`;

        const { rows } = await pool.query(query, params);
        return rows;
    }
};

module.exports = Report;
