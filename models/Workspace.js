const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Workspace = mongoose.model('Workspace', WorkspaceSchema);

module.exports = Workspace;
