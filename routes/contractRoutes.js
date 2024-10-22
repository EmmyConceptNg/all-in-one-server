const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post("/create", authMiddleware(["manager", "super_admin"]), contractController.addContract);
router.put("/terminate/:id", authMiddleware(["manager", "super_admin"]), contractController.terminateContract);
router.get("/all", authMiddleware(["super_admin", "manager"]), contractController.getContracts);
router.post("/extend", authMiddleware(["super_admin", "manager"]), contractController.extendContract);

module.exports = router;