const TimeTracker = require('../models/TimeTracker');

exports.startTimer = async (req, res) => {
    const { userId, userName } = req; 
  
    try {
      const existingTimer = await TimeTracker.findOne({ userId, status: 'started' });
  
      if (existingTimer) {
        return res.status(400).json({ message: 'You already have an ongoing timer' });
      }
  
      const newTimeTracker = new TimeTracker({
        userId,
        staffName: userName, 
        startTime: Date.now(),
        status: 'started'
      });
  
      await newTimeTracker.save();
      res.status(201).json({ message: 'Timer started successfully', timeTracker: newTimeTracker });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

exports.endTimer = async (req, res) => {
  const { userId } = req;

  try {
    const ongoingTimer = await TimeTracker.findOne({ userId, status: 'started' });

    if (!ongoingTimer) {
      return res.status(404).json({ message: 'No ongoing timer found' });
    }

    ongoingTimer.endTime = Date.now();
    ongoingTimer.status = 'ended';
    await ongoingTimer.save();

    res.status(200).json({ message: 'Timer ended successfully', timeTracker: ongoingTimer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllTimeEntries = async (req, res) => {
  const { userId } = req;

  try {
    const timeEntries = await TimeTracker.find({ userId });
    res.status(200).json({ timeEntries });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.pauseTimer = async (req, res) => {
  const { userId, userName } = req; 

  try {
    const ongoingTimer = await TimeTracker.findOne({ staffName: userName, status: 'started' });

    if (!ongoingTimer) {
      return res.status(404).json({ message: 'No ongoing timer found' });
    }

    if (ongoingTimer.status !== 'paused') {
      ongoingTimer.status = 'paused';
      ongoingTimer.pauseTime = Date.now();
      await ongoingTimer.save();

      res.status(200).json({ message: 'Timer paused successfully', timeTracker: ongoingTimer });
    } else {
      return res.status(400).json({ message: 'Timer is already paused' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};