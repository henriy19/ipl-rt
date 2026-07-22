const Report = require('../models/reportModel');

const GetRekapitulasi = async (req, res, next) => {
    try {
        const now = new Date();
        const currentTahun = now.getFullYear();
        const currentBulan = now.getMonth() + 1;

        let { tahun, bulan, rt_id } = req.query;

        tahun = tahun !== undefined ? parseInt(tahun, 10) : currentTahun;
        
        if (isNaN(tahun) || tahun < 2000 || tahun > 2100) {
            return res.error('Tahun tidak valid', 400);
        }

        // 1. Dapatkan rekap pemasukan bulanan sepanjang tahun
        const pemasukanBulanan = await Report.getPemasukanBulanan(tahun, rt_id);
        
        // Hitung total pemasukan dalam setahun
        const totalPemasukanTahunan = pemasukanBulanan.reduce((sum, item) => sum + item.total, 0);

        // 2. Dapatkan daftar seluruh tagihan warga
        const tagihanWarga = await Report.getTunggakanWarga(bulan, tahun, rt_id);

        // Hitung total nilai tunggakan yang belum lunas (status != paid)
        const totalTunggakan = tagihanWarga
            .filter(item => item.status !== 'paid')
            .reduce((sum, item) => sum + parseFloat(item.nominal_tagihan), 0);

        return res.success('Berhasil mengambil data rekapitulasi laporan', {
            tahun,
            bulan_filter: bulan || 'Semua',
            rt_id_filter: rt_id || '',
            total_pemasukan_tahunan: totalPemasukanTahunan,
            total_tunggakan: totalTunggakan,
            rekap_pemasukan_bulanan: pemasukanBulanan,
            daftar_tunggakan: tagihanWarga
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetRekapitulasi
};
