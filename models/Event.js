const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'CANCELLED', 'COMPLETED', 'OVERDUE'],
    default: 'IN_PROGRESS'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  progressInPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
