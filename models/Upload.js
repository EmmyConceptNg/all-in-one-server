const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  employeeId: {
    type: String, 
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;