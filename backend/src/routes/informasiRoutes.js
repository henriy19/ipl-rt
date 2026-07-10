const express = require('express');
const {
    GetAllInformasi,
    GetLatestInformasi,
    GetInformasiById,
    CreateInformasi,
    UpdateInformasi,
    DeleteInformasi
} = require('../controllers/informasiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute di bawah membutuhkan token JWT
router.use(protect);

// Helper middleware untuk pengecekan role secara modular
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.nama_role)) {
            return res.error('Anda tidak memiliki izin untuk mengakses fitur ini', 403);
        }
        next();
    };
};

// Rute untuk 5 event terakhir
router.get('/latest', GetLatestInformasi);

// Rute dasar /api/informasi
router.route('/')
    .get(GetAllInformasi)
    .post(authorizeRoles('Admin', 'Petugas', 'Bendahara'), CreateInformasi);

// Rute spesifik /api/informasi/:id
router.route('/:id')
    .get(GetInformasiById)
    .put(authorizeRoles('Admin', 'Petugas', 'Bendahara'), UpdateInformasi)
    .delete(authorizeRoles('Admin', 'Petugas', 'Bendahara'), DeleteInformasi);

module.exports = router;
