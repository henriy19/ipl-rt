const express = require('express');
const { GetDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', GetDashboardStats);

module.exports = router;
