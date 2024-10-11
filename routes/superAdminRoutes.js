const { Router } = require('express');
const { getAllMappedDetails } = require('../controllers/superAdminController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = Router();

router.get('/mapped_details', authMiddleware(['super_admin']), getAllMappedDetails);

module.exports = router;