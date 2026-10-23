import { calendarService } from '../services/calendar/CalendarService.js';

let reminderInterval = null;

export const initCalendarReminderCron = (io) => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  console.log('[Cron] Initializing 1-Hour Pre-Meeting Calendar Reminder Watchdog (runs every 5 mins)...');

  // Run on startup
  calendarService.processUpcomingReminders(io).catch((err) => {
    console.warn('[Cron] Initial calendar reminder check error:', err.message);
  });

  // Check every 5 minutes
  reminderInterval = setInterval(async () => {
    try {
      const result = await calendarService.processUpcomingReminders(io);
      if (result.processedCount > 0) {
        console.log(`[Cron] Calendar Reminders dispatched for ${result.processedCount} upcoming meeting(s)`);
      }
    } catch (err) {
      console.warn('[Cron] Error running calendar reminders cron:', err.message);
    }
  }, 5 * 60 * 1000);
};
