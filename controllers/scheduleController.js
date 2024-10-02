const Schedule = require('../models/Schedule');

exports.addSchedule = async (req, res) => {
    const { scheduleType, startDate, endDate, notes } = req.body;

    if (req.userRole !== 'super_admin' && req.userRole !== 'manager') {
        return res.status(403).json({ message: "Access denied: You are not authorized to add schedules." });
    }

    try {
        const newSchedule = new Schedule({
            userId: req.userId,
            scheduleType,
            startDate,
            endDate,
            notes,
        });

        await newSchedule.save();
        res.status(201).json({ message: "Schedule added successfully", schedule: newSchedule });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUserSchedules = async (req, res) => {
    try {
        const query = req.userRole === 'staff' ? { userId: req.userId } : {}; 
        const schedules = await Schedule.find(query);
        res.status(200).json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteSchedule = async (req, res) => {
    const { id } = req.params;

    if (req.userRole !== 'super_admin' && req.userRole !== 'manager') {
        return res.status(403).json({ message: "Access denied: You are not authorized to delete schedules." });
    }

    try {
        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        await Schedule.deleteOne({ _id: id });
        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ message: "Server error" });
    }
};
