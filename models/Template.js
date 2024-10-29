const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    logoPath: {
      type: String,
    },
    fileName: String,
    fileSize: String,
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
