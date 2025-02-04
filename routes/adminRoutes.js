const authController = require("../controllers/admin/authController");
const { getAllSuperAdmin, enableSuperAdmin, disableSuperAdmin, getSingleSuperAdmin } = require("../controllers/admin/superAdminController");
const authAdminMiddleware = require("../middlewares/authAdminMiddleware");
router.post("/login", authController);
router.post("/register", authController);
router.post("/clients",authAdminMiddleware(['admin']), getAllSuperAdmin);
router.post("/clients/disable",authAdminMiddleware(['admin']), disableSuperAdmin);
router.post("/clients/enable",authAdminMiddleware(['admin']), enableSuperAdmin);
router.post("/clients/:id",authAdminMiddleware(['admin']), getSingleSuperAdmin);
