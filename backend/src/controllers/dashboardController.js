const Dashboard = require('../models/dashboardModel');

const GetDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();
        const currentBulan = now.getMonth() + 1;
        const currentTahun = now.getFullYear();

        const role = req.user.nama_role;

        if (role === 'Warga') {
            const data = await Dashboard.getWargaStats(req.user.id, currentBulan, currentTahun);
            return res.success('Berhasil mengambil statistik dashboard warga', data);
        } else {
            // Admin, Petugas, Bendahara
            const data = await Dashboard.getAdminStats(currentBulan, currentTahun);
            return res.success('Berhasil mengambil statistik dashboard pengurus', data);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetDashboardStats
};
