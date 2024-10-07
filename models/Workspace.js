const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkspaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  employees: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);
