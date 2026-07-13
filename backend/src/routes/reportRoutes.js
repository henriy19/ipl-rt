const express = require('express');
const { GetRekapitulasi } = require('../controllers/reportController');
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

// Rute untuk mengambil rekapitulasi keuangan
router.get('/rekapitulasi', authorizeRoles('Admin', 'Petugas', 'Bendahara'), GetRekapitulasi);

module.exports = router;
