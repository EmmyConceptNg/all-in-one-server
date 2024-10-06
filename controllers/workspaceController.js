const Workspace = require('../models/Workspace');

exports.addWorkspace = async (req, res) => {
  const { name, branch, color } = req.body;

  try {
    const newWorkspace = new Workspace({ name, branch, color });
    await newWorkspace.save();
    res.status(201).json({ message: 'Workspace added successfully', workspace: newWorkspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editWorkspace = async (req, res) => {
  const workspaceId = req.params.id;
  const { name, branch, color } = req.body;

  try {
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { name, branch, color, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedWorkspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.status(200).json({ message: 'Workspace updated successfully', workspace: updatedWorkspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteWorkspace = async (req, res) => {
  const workspaceId = req.params.id;

  try {
    const deletedWorkspace = await Workspace.findByIdAndDelete(workspaceId);

    if (!deletedWorkspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find();
    res.status(200).json({ workspaces });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWorkspaceById = async (req, res) => {
  const workspaceId = req.params.id;

  try {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.status(200).json({ workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
