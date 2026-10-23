import express from 'express';
import { calendarService } from '../services/calendar/CalendarService.js';
import { Lead } from '../models/Lead.js';

const router = express.Router();

/**
 * GET /api/calendar/slots
 * Instant slot availability check (<300ms) for AI Voice Agent and WhatsApp bots
 */
router.get('/slots', async (req, res) => {
  try {
    const { workspaceId, date, days, timezone } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const result = await calendarService.getAvailableSlots({
      workspaceId,
      date,
      days: days ? Number(days) : 3,
      timezone: timezone || 'America/New_York',
    });

    return res.json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error checking slots:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/calendar/book
 * Schedule an appointment with automatic Google Meet link and SMS reminder trigger
 */
router.post('/book', async (req, res) => {
  try {
    const io = req.app.get('io');
    const {
      workspaceId,
      leadId,
      title,
      description,
      startTime,
      endTime,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      bookedBy,
      timezone,
      notes,
    } = req.body;

    if (!workspaceId || !startTime || !attendeeName || !attendeeEmail) {
      return res.status(400).json({
        success: false,
        message: 'workspaceId, startTime, attendeeName, and attendeeEmail are required',
      });
    }

    const result = await calendarService.bookAppointment({
      workspaceId,
      leadId,
      title,
      description,
      startTime,
      endTime,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      bookedBy: bookedBy || 'AI_VOICE_AGENT',
      timezone: timezone || 'America/New_York',
      notes,
      io,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error booking appointment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/calendar/appointments
 * List appointments with filters
 */
router.get('/appointments', async (req, res) => {
  try {
    const { workspaceId, startDate, endDate, status, limit } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const result = await calendarService.getAppointments({
      workspaceId,
      startDate,
      endDate,
      status,
      limit: limit ? Number(limit) : 50,
    });

    return res.json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error fetching appointments:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/calendar/appointments/:id
 * Update status or reschedule
 */
router.patch('/appointments/:id', async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id } = req.params;
    const { status, notes, newStartTime, newEndTime, rescheduleReason } = req.body;

    if (newStartTime) {
      const result = await calendarService.rescheduleAppointment({
        appointmentId: id,
        newStartTime,
        newEndTime,
        reason: rescheduleReason,
        io,
      });
      return res.json(result);
    }

    const result = await calendarService.updateAppointmentStatus({
      appointmentId: id,
      status,
      notes,
      io,
    });

    return res.json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error updating appointment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/calendar/config
 * Get calendar connection settings
 */
router.get('/config', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const result = await calendarService.getCalendarConfig(workspaceId);
    return res.json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error fetching calendar config:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/calendar/google/connect
 * Connect Google Calendar OAuth
 */
router.post('/google/connect', async (req, res) => {
  try {
    const { workspaceId, email, calendarId, accessToken, refreshToken } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const result = await calendarService.connectGoogleCalendar({
      workspaceId,
      email,
      calendarId,
      accessToken,
      refreshToken,
    });

    return res.json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error connecting Google Calendar:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/calendar/calcom/connect
 * Connect Cal.com API
 */
router.post('/calcom/connect', async (req, res) => {
  try {
    const { workspaceId, apiKey, eventTypeId, username } = req.body;
    if (!workspaceId || !apiKey || !username) {
      return res.status(400).json({ success: false, message: 'workspaceId, apiKey, and username are required' });
    }

    const result = await calendarService.connectCalCom({
      workspaceId,
      apiKey,
      eventTypeId,
      username,
    });

    return res.json(result);
  } catch (error) {
    console.error('[CalendarRoutes] Error connecting Cal.com:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/calendar/reminders/process
 * Trigger reminder dispatch check
 */
router.post('/reminders/process', async (req, res) => {
  try {
    const io = req.app.get('io');
    const result = await calendarService.processUpcomingReminders(io);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('[CalendarRoutes] Error processing reminders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
