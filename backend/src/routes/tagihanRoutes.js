const express = require('express');
const {
    GenerateTagihan,
    GetAllTagihan,
    GetWargaHistory,
    BayarTagihan
} = require('../controllers/tagihanController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute membutuhkan token JWT
router.use(protect);

// Helper middleware untuk pengecekan role secara modular
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.nama_role)) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Anda tidak memiliki izin untuk mengakses fitur ini' 
            });
        }
        next();
    };
};

// Rute untuk warga melihat riwayat tagihannya sendiri
router.get('/history', GetWargaHistory);

// Rute untuk generate tagihan baru
router.post('/generate', authorizeRoles('Admin', 'Petugas', 'Bendahara'), GenerateTagihan);

// Rute untuk melihat seluruh data tagihan (Admin)
router.get('/', authorizeRoles('Admin', 'Petugas', 'Bendahara'), GetAllTagihan);

// Rute untuk membayar / menandai lunas tagihan
router.post('/:id/bayar', authorizeRoles('Admin', 'Petugas', 'Bendahara'), BayarTagihan);

module.exports = router;
