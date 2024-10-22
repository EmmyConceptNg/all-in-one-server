const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadFile, fetchUserTemplates, deleteTemplate, assignTemplate } = require("../controllers/templatesController");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); 
  },
});

const upload = multer({ storage: storage }).single("pdfFile");


router.post(
  "/documents",
  authMiddleware(["super_admin", "manager"]),
  upload,
  uploadFile
);
router.get(
  "/",
  authMiddleware(["super_admin", "manager"]),
  fetchUserTemplates
);
router.post("/use", authMiddleware(["super_admin", "manager"]), assignTemplate);
router.delete(
  "/:templateId",
  authMiddleware(["super_admin", "manager"]),
  deleteTemplate
);

module.exports = router;
