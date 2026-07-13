const Tagihan = require('../models/tagihanModel');

const GenerateTagihan = async (req, res, next) => {
    try {
        let { bulan, tahun } = req.body;
        
        const now = new Date();
        const currentBulan = now.getMonth() + 1; // getMonth is 0-indexed
        const currentTahun = now.getFullYear();

        // Gunakan default jika tidak dikirimkan
        bulan = bulan !== undefined ? parseInt(bulan, 10) : currentBulan;
        tahun = tahun !== undefined ? parseInt(tahun, 10) : currentTahun;

        // Validasi input
        if (isNaN(bulan) || bulan < 1 || bulan > 12) {
            return res.error('Bulan harus bernilai antara 1 sampai 12', 400);
        }
        if (isNaN(tahun) || tahun < 2000 || tahun > 2100) {
            return res.error('Tahun harus bernilai 4-digit valid (2000-2100)', 400);
        }

        const result = await Tagihan.generateBulanan(bulan, tahun);
        
        if (result.message) {
            return res.error(result.message, 400);
        }

        return res.success(`Berhasil membuat ${result.count} tagihan baru untuk periode ${bulan}/${tahun}`, {
            generated_count: result.count,
            periode: `${bulan}/${tahun}`
        }, 201);
    } catch (error) {
        next(error);
    }
};

const GetAllTagihan = async (req, res, next) => {
    try {
        const { bulan, tahun, status, user_id } = req.query;
        const filters = { bulan, tahun, status, user_id };

        const tagihan = await Tagihan.getAll(filters);
        return res.success('Berhasil mengambil semua data tagihan', tagihan);
    } catch (error) {
        next(error);
    }
};

const GetWargaHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const history = await Tagihan.getByWargaId(userId);
        return res.success('Berhasil mengambil riwayat tagihan', history);
    } catch (error) {
        next(error);
    }
};

const BayarTagihan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { metode_pembayaran, catatan_bendahara } = req.body;

        const tagihan = await Tagihan.getById(id);
        if (!tagihan) {
            return res.error('Tagihan tidak ditemukan', 404);
        }

        if (tagihan.status === 'paid') {
            return res.error('Tagihan ini sudah lunas sebelumnya', 400);
        }

        const paymentData = {
            dicatat_oleh: req.user.id,
            diverifikasi_oleh: req.user.id,
            metode_pembayaran: metode_pembayaran || 'cash',
            catatan_bendahara: catatan_bendahara || 'Ditandai lunas manual oleh pengurus',
            tanggal_bayar: new Date(),
            tanggal_verifikasi: new Date()
        };

        const result = await Tagihan.bayar(id, paymentData);

        if (!result.success) {
            return res.error(result.message || 'Gagal memproses pembayaran', 400);
        }

        return res.success('Tagihan berhasil ditandai Lunas');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GenerateTagihan,
    GetAllTagihan,
    GetWargaHistory,
    BayarTagihan
};
