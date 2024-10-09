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
  status: String,
  budget: Number,
  skillsRequired: [String],
  progress: Number
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;