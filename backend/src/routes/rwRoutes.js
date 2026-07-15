const express = require('express');
const { 
    GetAllRW, 
    GetRWById, 
    CreateRW, 
    UpdateRW, 
    DeleteRW 
} = require('../controllers/rwController');
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

// Rute manajemen Rukun Warga (RW)
router.route('/')
    .get(GetAllRW)
    .post(authorizeRoles('Admin', 'Petugas', 'Bendahara'), CreateRW);

router.route('/:id')
    .get(GetRWById)
    .put(authorizeRoles('Admin', 'Petugas', 'Bendahara'), UpdateRW)
    .delete(authorizeRoles('Admin', 'Petugas', 'Bendahara'), DeleteRW);

module.exports = router;
