const express = require('express');
const {
    GetAllIuran,
    GetIuranById,
    CreateIuran,
    UpdateIuran,
    DeleteIuran
} = require('../controllers/iuranController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute di bawah membutuhkan token JWT
router.use(protect);

router.route('/')
    .get(GetAllIuran)
    .post(CreateIuran);

router.route('/:id')
    .get(GetIuranById)
    .put(UpdateIuran)
    .delete(DeleteIuran);

module.exports = router;
