const authController = require("../controllers/admin/authController");
const { getAllSuperAdmin, enableSuperAdmin, disableSuperAdmin, getSingleSuperAdmin } = require("../controllers/admin/superAdminController");
const authAdminMiddleware = require("../middlewares/authAdminMiddleware");
router.post("/admin/login", authController);
router.post("/admin/clients",authAdminMiddleware(['admin']), getAllSuperAdmin);
router.post("/admin/clients/disable",authAdminMiddleware(['admin']), disableSuperAdmin);
router.post("/admin/clients/enable",authAdminMiddleware(['admin']), enableSuperAdmin);
router.post("/admin/clients/:id",authAdminMiddleware(['admin']), getSingleSuperAdmin);
