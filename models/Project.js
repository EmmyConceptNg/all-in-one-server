const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
  projectName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [String],
  projectDescription: String,
  status: { 
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
    default: 'NOT_STARTED'
  },
  budget: Number,
  skillsRequired: [String],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;