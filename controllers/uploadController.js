const multer = require("multer");
const path = require("path");
const Upload = require("../models/Upload");
const { getSuperAdminIdForStaff } = require("../utils/userUtils");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single("pdfFile");

const uploadFile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "File path not provided" });
    }

    try {
      const superAdminOrManagerId = await getSuperAdminIdForStaff(req.user._id);

      if (!superAdminOrManagerId) {
        return res.status(400).json({ message: "Invalid superAdminId or managerId provided" });
      }

      const newUpload = new Upload({
        employeeId: superAdminOrManagerId,
        filePath: req.file.path
      });

      await newUpload.save();

      return res.status(200).json({ message: "PDF file uploaded successfully" });
    } catch (error) {
      console.error("Internal server error:", error);
      return res.status(500).json({ message: "Internal server error. Please check the logs for more details." });
    }
  });
};

module.exports = {
  uploadFile
};