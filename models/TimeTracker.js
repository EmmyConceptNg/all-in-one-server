const mongoose = require('mongoose');

const TimeTrackerSchema = new mongoose.Schema({
  staffName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['started', 'ended'], default: 'started' }
});

const TimeTracker = mongoose.model('TimeTracker', TimeTrackerSchema);

module.exports = TimeTracker;
