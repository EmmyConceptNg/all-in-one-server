const mongoose = require('mongoose');

const sickLeaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  dates: [{
    type: Date,
    required: true
  }],
  workingDaysCount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('SickLeave', sickLeaveSchema);
