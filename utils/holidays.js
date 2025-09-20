const OfficialHoliday = require('../models/OfficialHoliday');

// Returns true if the provided Date is Thursday or Friday
function isFixedWeeklyHoliday(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  return day === 4 || day === 5;
}

// Returns true if the date falls inside any official holiday range (inclusive)
async function isOfficialHoliday(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  const found = await OfficialHoliday.exists({
    start_date: { $lte: endOfDay },
    end_date: { $gte: startOfDay },
  });
  return Boolean(found);
}

// Returns true if date is a holiday for any reason (fixed Thu/Fri or official)
async function isHoliday(date) {
  if (isFixedWeeklyHoliday(date)) return true;
  return isOfficialHoliday(date);
}

module.exports = {
  isFixedWeeklyHoliday,
  isOfficialHoliday,
  isHoliday,
};


