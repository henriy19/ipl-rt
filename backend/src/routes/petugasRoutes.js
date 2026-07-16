const express = require('express');
const { 
    GetAllPetugas, 
    GetPetugasById, 
    CreatePetugas, 
    UpdatePetugas, 
    DeletePetugas 
} = require('../controllers/petugasController');
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

// Rute manajemen Petugas
router.route('/')
    .get(GetAllPetugas)
    .post(authorizeRoles('Admin', 'Petugas', 'Bendahara'), CreatePetugas);

router.route('/:id')
    .get(GetPetugasById)
    .put(authorizeRoles('Admin', 'Petugas', 'Bendahara'), UpdatePetugas)
    .delete(authorizeRoles('Admin', 'Petugas', 'Bendahara'), DeletePetugas);

module.exports = router;
