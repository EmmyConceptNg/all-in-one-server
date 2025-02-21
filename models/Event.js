const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["STARTED", "IN_PROGRESS", "CANCELLED", "COMPLETED", "OVERDUE"],
      default: "STARTED",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    progressInPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
