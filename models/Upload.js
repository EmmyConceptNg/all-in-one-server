const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
});

const Upload = mongoose.model("Upload", uploadSchema);

module.exports = Upload;