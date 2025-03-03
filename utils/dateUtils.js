exports.calculateWorkingDays = (startDate, endDate) => {
  let count = 0;
  const curDate = new Date(startDate);
  const end = new Date(endDate);

  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  
  return count;
};

exports.generateDateArray = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

exports.getWorkingDatesArray = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  
  let current = new Date(start);
  while (current <= end) {
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};
