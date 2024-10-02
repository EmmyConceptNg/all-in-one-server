const Project = require('../models/Project');
const User = require('../models/User'); 

exports.addProject = async (req, res) => {
  const { projectName, startDate, endDate, description, managerId, tasks, status, budget, skillsRequired } = req.body;

  try {
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const newProject = new Project({
      projectName,
      startDate,
      endDate,
      description,
      manager: managerId,
      tasks,
      createdBy: req.userId, 
      status,
      budget,
      skillsRequired,
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('manager', 'firstName lastName'); 
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.editProject = async (req, res) => {
  const { id } = req.params;
  const { projectName, startDate, endDate, description, managerId, tasks, status, budget, skillsRequired, progress } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.userId && req.userRole !== 'super_admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this project' });
    }

    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager) {
        return res.status(404).json({ message: 'Manager not found' });
      }
      project.manager = managerId; 
    }

    project.projectName = projectName || project.projectName;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.description = description || project.description;
    project.tasks = tasks || project.tasks;
    project.status = status || project.status;
    project.budget = budget || project.budget;
    project.skillsRequired = skillsRequired || project.skillsRequired;
    project.progress = progress !== undefined ? progress : project.progress; 

    await project.save();
    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.userId && req.userRole !== 'super_admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this project' });
    }

    await Project.deleteOne({ _id: id });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
