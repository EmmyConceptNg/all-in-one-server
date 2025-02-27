const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  superAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduleType: {
    type: String,
    enum: ["holiday", "sick_leave", "annual_leave"],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  occurrence: {
    type: String,
    enum: ["weekdays", "daily", "individual"],
    default: "individual",
  },
  notes: { type: String, required: false },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Schedule", scheduleSchema);