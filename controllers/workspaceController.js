const Workspace = require('../models/Workspace');
const Employee = require('../models/Employee');

exports.addWorkspace = async (req, res) => {
  const { workspaceName, branch, color } = req.body;

  try {
    const newWorkspace = new Workspace({
      workspaceName,
      branch,
      color,
      createdBy: req.userId 
    });
    await newWorkspace.save();

    res.status(201).json({ message: 'Workspace added successfully', workspace: newWorkspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editWorkspace = async (req, res) => {
  const workspaceId = req.params.id;
  const { workspaceName, branch, color } = req.body;

  try {
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { workspaceName, branch, color, updatedAt: Date.now() },
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
exports.getAllWorkspacesByCreator = async (req, res) => {
  try {
    let workspaces = [];

    if (req.userRole === "super_admin") {
      // Get all employees under a super admin
      const employees = await Employee.find({ superAdminId: req.userId });

      // Gather employee IDs with the 'manager' role
      const managerIds = employees
        .filter((employee) => employee.role === "manager")
        .map((manager) => manager._id);

      // Get workspaces created by the super admin or by managers under them
      workspaces = await Workspace.find({
        $or: [{ createdBy: req.userId }, { createdBy: { $in: managerIds } }],
      });
    } else if (req.userRole === "manager") {
      const employee = await Employee.findOne({ userId: req.userId });
      if (employee) {
        // Get workspaces created by this manager
        workspaces = await Workspace.find({ createdBy: employee._id });
      }
    } else if (req.userRole === "staff") {
      // Get workspaces where this staff member is part of the employees array
      workspaces = await Workspace.find({ employees: req.userId });
    } else {
      // Get all workspaces for any other role
      workspaces = await Workspace.find();
    }

    res.status(200).json({ workspaces });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.addEmployeeToWorkspace = async (req, res) => {
  const { employeeId, workspaceId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    workspace.employees.push(employee);
    await workspace.save();

    res.status(200).json({ message: 'Employee added to workspace successfully', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};