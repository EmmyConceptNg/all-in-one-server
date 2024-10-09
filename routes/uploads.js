const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const uploadController = require("../controllers/uploadController");

router.post("/:employeeId", authMiddleware(["super_admin", "manager"]), uploadController.uploadFile);

module.exports = router;