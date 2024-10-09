const multer = require("multer");
const path = require("path");
const Upload = require("../models/Upload");

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
      return res.status(500).json({ message: "File upload failed" });
    }

    const { employeeId } = req.params;
    const filePath = req.file.path;

    try {
      const newUpload = new Upload({
        employeeId,
        filePath
      });

      await newUpload.save();

      return res.status(200).json({ message: "PDF file uploaded successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = {
  uploadFile
};