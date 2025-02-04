const Contract = require("../../models/Contracts");
const Employee = require("../../models/Employee");
const Project = require("../../models/Project");
const Schedule = require("../../models/Schedule");
const Shifts = require("../../models/Shifts");
const User = require("../../models/User");
const Workspace = require("../../models/Workspace");

exports.getAllSuperAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || ""; // Get search query
    const status = req.query.status; // Get enabled/disabled filter
    const skip = (page - 1) * limit;

    // Base filter: Only fetch super admins
    let filter = {
      role: "super_admin",
      $or: [
        { firstName: { $regex: searchQuery, $options: "i" } },
        { lastName: { $regex: searchQuery, $options: "i" } },
      ],
    };

    // Apply enabled/disabled filter if provided
    if (status === "enabled") {
      filter.disabled = false;
    } else if (status === "disabled") {
      filter.disabled = true;
    }

    const [superAdmins, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: superAdmins,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


exports.disableSuperAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const superAdmin = await User.findById(req.params.id)
      .where("role")
      .equals("super_admin")
      .session(session);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Disable Super Admin
    await User.findByIdAndUpdate(
      req.params.id,
      { disabled: true },
      { session }
    );

    // Disable all associated employees
    await Employee.updateMany(
      { superAdminId: req.params.id },
      { disabled: true },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Super Admin and associated employees disabled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
}


exports.enableSuperAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const superAdmin = await User.findById(req.params.id)
      .where("role")
      .equals("super_admin")
      .session(session);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Disable Super Admin
    await User.findByIdAndUpdate(
      req.params.id,
      { disabled: false },
      { session }
    );

    // Disable all associated employees
    await Employee.updateMany(
      { superAdminId: req.params.id },
      { disabled: false },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Super Admin and associated employees disabled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};


exports.getSingleSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await User.findById(req.params.id)
      .where("role")
      .equals("super_admin");

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Fetch counts instead of full documents
    const employees = await Employee.find({ superAdminId: superAdmin._id });
    const workspaces = await Workspace.find({
      createdBy: superAdmin._id,
    }).countDocuments();
    const userCount = await User.countDocuments({
      superAdminId: superAdmin._id,
    });
    const scheduleCount = await Schedule.countDocuments({
      superAdminId: superAdmin._id,
    });
    const projectCount = await Project.countDocuments({
      superAdminId: superAdmin._id,
    });
    const contractCount = await Contract.countDocuments({
      superAdminId: superAdmin._id,
    });
    const shiftCount = await Shifts.countDocuments({
      superAdminId: superAdmin._id,
    });
   

    // Filter employees into managers and regular staff
    const managerCount = employees.filter(
      (employee) => employee.role === "manager"
    ).length;
    const regularEmployeeCount = employees.filter(
      (employee) => employee.role === "staff"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        superAdmin,
        userCount,
        managerCount,
        regularEmployeeCount,
        workspaces,
        scheduleCount,
        projectCount,
        contractCount,
        shiftCount,
        employees,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
