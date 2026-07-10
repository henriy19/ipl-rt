const express = require('express');
const { GetAllRT } = require('../controllers/rtController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Dilindungi middleware token JWT
router.get('/', protect, GetAllRT);

module.exports = router;
