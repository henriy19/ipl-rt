const express = require('express');
const { 
    GetAllRoles, 
    GetRoleById, 
    CreateRole, 
    UpdateRole, 
    DeleteRole 
} = require('../controllers/roleController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua route dilindungi middleware token JWT
router.use(protect);

router.route('/')
    .get(GetAllRoles)
    .post(CreateRole);

router.route('/:id')
    .get(GetRoleById)
    .put(UpdateRole)
    .delete(DeleteRole);

module.exports = router;
