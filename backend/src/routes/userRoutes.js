const express = require('express');
const { 
    GetAllWarga, 
    GetWargaById, 
    CreateWarga, 
    UpdateWarga, 
    DeleteWarga 
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute di bawah membutuhkan token JWT
router.use(protect);

router.route('/')
    .get(GetAllWarga)
    .post(CreateWarga);

router.route('/:id')
    .get(GetWargaById)
    .put(UpdateWarga)
    .delete(DeleteWarga);

module.exports = router;
