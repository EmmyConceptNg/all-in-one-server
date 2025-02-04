const express = require('express');
const router = express.Router();

const authController = require("../controllers/admin/authController");
const { getAllSuperAdmin, enableSuperAdmin, disableSuperAdmin, getSingleSuperAdmin } = require("../controllers/admin/superAdminController");
const authAdminMiddleware = require("../middlewares/authAdminMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/clients",authAdminMiddleware(['admin']), getAllSuperAdmin);
router.get("/clients/disable/:id",authAdminMiddleware(['admin']), disableSuperAdmin);
router.get("/clients/enable/:id",authAdminMiddleware(['admin']), enableSuperAdmin);
router.get("/clients/:id",authAdminMiddleware(['admin']), getSingleSuperAdmin);

module.exports = router;