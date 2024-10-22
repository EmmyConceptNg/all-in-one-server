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
    fileName: String,
    fileSize: String,
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
