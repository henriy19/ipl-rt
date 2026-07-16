const express = require('express');
const { 
    GetAllStruktur, 
    GetStrukturById, 
    CreateStruktur, 
    UpdateStruktur, 
    DeleteStruktur 
} = require('../controllers/strukturController');
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

// Rute manajemen Struktur Organisasi
router.route('/')
    .get(GetAllStruktur)
    .post(authorizeRoles('Admin', 'Petugas', 'Bendahara'), CreateStruktur);

router.route('/:id')
    .get(GetStrukturById)
    .put(authorizeRoles('Admin', 'Petugas', 'Bendahara'), UpdateStruktur)
    .delete(authorizeRoles('Admin', 'Petugas', 'Bendahara'), DeleteStruktur);

module.exports = router;
