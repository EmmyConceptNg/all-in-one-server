const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  dueDate: { 
    type: Date, 
    required: true 
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
    default: 'NOT_STARTED'
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  weight: {
    type: Number,
    min: 1,
    max: 100,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);
