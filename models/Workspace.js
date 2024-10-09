const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    workspaceName: { type: String, required: true },
    branch: { type: String, required: true },
    color: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;