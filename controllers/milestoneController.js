const Milestone = require('../models/Milestone');
const Project = require('../models/Project');

exports.createMilestone = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, weight } = req.body;

    // Validate total weight doesn't exceed 100
    const existingMilestones = await Milestone.find({ projectId });
    const totalExistingWeight = existingMilestones.reduce((sum, m) => sum + m.weight, 0);
    
    if (totalExistingWeight + (weight || 1) > 100) {
      return res.status(400).json({ 
        message: 'Total milestone weights cannot exceed 100',
        currentTotal: totalExistingWeight,
        attemptedWeight: weight,
        remaining: 100 - totalExistingWeight
      });
    }

    // Check if project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ superAdminId: req.userId }, { managers: req.userId }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    const milestone = new Milestone({
      projectId,
      title,
      description,
      dueDate,
      weight
    });

    await milestone.save();

    // Update project progress
    await updateProjectProgress(projectId);

    res.status(201).json({ milestone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate completion percentage
    if (updates.completionPercentage !== undefined) {
      if (updates.completionPercentage < 0 || updates.completionPercentage > 100) {
        return res.status(400).json({ 
          message: 'Completion percentage must be between 0 and 100' 
        });
      }
    }

    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Check project access
    const project = await Project.findOne({
      _id: milestone.projectId,
      $or: [{ superAdminId: req.userId }, { managers: req.userId }]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update milestone with new values
    const updatedMilestone = await Milestone.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    // Update project progress
    await updateProjectProgress(milestone.projectId);

    res.status(200).json({ milestone: updatedMilestone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;

    const milestones = await Milestone.find({ projectId })
      .sort({ dueDate: 1 });

    res.status(200).json({ milestones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Check project access
    const project = await Project.findOne({
      _id: milestone.projectId,
      $or: [{ superAdminId: req.userId }, { managers: req.userId }]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Milestone.findByIdAndDelete(id);

    // Update project progress
    await updateProjectProgress(milestone.projectId);

    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function updateProjectProgress(projectId) {
  const milestones = await Milestone.find({ projectId });
  
  if (milestones.length === 0) return;

  let totalWeight = 0;
  let completedWeight = 0;

  milestones.forEach(milestone => {
    totalWeight += milestone.weight;
    completedWeight += (milestone.weight * milestone.completionPercentage / 100);
  });

  const progress = Math.round((completedWeight / totalWeight) * 100);
  
  // Determine project status based on milestones
  let status = 'NOT_STARTED';
  if (progress === 100) {
    status = 'COMPLETED';
  } else if (progress > 0) {
    status = 'IN_PROGRESS';
  }

  await Project.findByIdAndUpdate(projectId, { 
    progress,
    status
  });
}
