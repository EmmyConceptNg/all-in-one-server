const Project = require('../models/Project');
const User = require('../models/User'); 

exports.addProject = async (req, res) => {
  const {
    projectName,
    startDate,
    endDate,
    managerId,
    tasks,
    projectDescription,
    status,
    budget,
    skillsRequired,
    progress
  } = req.body;

  try {
    const newProject = new Project({
      superAdminId: req.userId,
      projectName,
      startDate,
      endDate,
      managerId,
      tasks,
      projectDescription,
      status,
      budget,
      skillsRequired,
      progress
    });

    await newProject.save();

    res.status(201).json({ message: 'Project added successfully', project: newProject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllProjectsBySuperAdmin = async (req, res) => {
  try {
    const projects = await Project.find({ superAdminId: req.userId });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllProjectsByUser = async (req, res) => {
  try {
    const projects = await Project.find({ managers: req.userId });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    if (req.userRole === 'super_admin' || req.userRole === 'owner') {
      const projects = await Project.find();
      res.status(200).json({ projects });
    } else {
      const projects = await Project.find({ managers: req.userId });
      res.status(200).json({ projects });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editProject = async (req, res) => {
  const projectId = req.params.id;
  const updateFields = req.body;

  try {
    const updatedProject = await Project.findOneAndUpdate({ _id: projectId, managers: req.userId }, updateFields, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to edit this project' });
    }

    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    const deletedProject = await Project.findOneAndDelete({ _id: projectId, managers: req.userId });

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete this project' });
    }

    res.status(200).json({ message: 'Project deleted successfully', project: deletedProject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};