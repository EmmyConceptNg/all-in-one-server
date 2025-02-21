const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    
    const event = new Event({
      name,
      startDate,
      endDate,
      status,
      progressInPercentage: calculateProgress(status)
    });

    await event.save();
    res.status(201).json({ event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status) {
      updates.progressInPercentage = calculateProgress(updates.status);
    }

    const event = await Event.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ event, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

function calculateProgress(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return 50;
    case 'COMPLETED':
      return 100;
    case 'CANCELLED':
      return 0;
    case 'OVERDUE':
      return 75;
    default:
      return 0;
  }
}
