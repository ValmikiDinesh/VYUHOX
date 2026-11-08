import dotenv from 'dotenv';
import { getCountryByPhone, getCountryByIso } from '../../config/GlobalCountryCompliance.js';

dotenv.config();

/**
 * NPA Area Code to North American Timezones Map
 */
const US_AREA_CODE_TIMEZONES = {
  // Eastern Time (EST / EDT)
  '212': 'America/New_York', '718': 'America/New_York', '917': 'America/New_York', '646': 'America/New_York',
  '201': 'America/New_York', '973': 'America/New_York', '617': 'America/New_York', '508': 'America/New_York',
  '215': 'America/New_York', '267': 'America/New_York', '305': 'America/New_York', '407': 'America/New_York',
  '404': 'America/New_York', '770': 'America/New_York', '704': 'America/New_York', '202': 'America/New_York',
  // Central Time (CST / CDT)
  '312': 'America/Chicago', '773': 'America/Chicago', '214': 'America/Chicago', '972': 'America/Chicago',
  '713': 'America/Chicago', '281': 'America/Chicago', '512': 'America/Chicago', '612': 'America/Chicago',
  '615': 'America/Chicago', '901': 'America/Chicago', '504': 'America/Chicago', '314': 'America/Chicago',
  // Mountain Time (MST / MDT)
  '303': 'America/Denver', '720': 'America/Denver', '602': 'America/Phoenix', '480': 'America/Phoenix',
  '801': 'America/Denver', '505': 'America/Denver', '208': 'America/Boise', '406': 'America/Denver',
  // Pacific Time (PST / PDT)
  '213': 'America/Los_Angeles', '310': 'America/Los_Angeles', '415': 'America/Los_Angeles', '650': 'America/Los_Angeles',
  '408': 'America/Los_Angeles', '510': 'America/Los_Angeles', '858': 'America/Los_Angeles', '619': 'America/Los_Angeles',
  '206': 'America/Los_Angeles', '503': 'America/Los_Angeles', '702': 'America/Los_Angeles',
};

class CallingWindowGuard {
  /**
   * Determine exact target timezone for a destination phone number
   */
  resolveTimezone(phoneNumber, countryMeta) {
    if (countryMeta.iso === 'US' || countryMeta.iso === 'CA') {
      const clean = phoneNumber.replace(/[^\d]/g, '');
      const digits = clean.startsWith('1') ? clean.slice(1) : clean;
      const npa = digits.slice(0, 3);
      if (US_AREA_CODE_TIMEZONES[npa]) {
        return US_AREA_CODE_TIMEZONES[npa];
      }
    }
    return countryMeta.timezone || 'UTC';
  }

  /**
   * Get current time details in the specified timezone
   */
  getTimeDetailsInTimezone(timeZone) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'short',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const hourPart = parts.find((p) => p.type === 'hour')?.value || '12';
      const minutePart = parts.find((p) => p.type === 'minute')?.value || '00';
      const weekdayPart = parts.find((p) => p.type === 'weekday')?.value || 'Mon';

      const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const dayOfWeek = weekdayMap[weekdayPart] !== undefined ? weekdayMap[weekdayPart] : 1;
      const decimalHour = parseInt(hourPart, 10) + parseInt(minutePart, 10) / 60;

      return {
        dayOfWeek,
        decimalHour,
        formattedTime: `${hourPart.padStart(2, '0')}:${minutePart.padStart(2, '0')} (${weekdayPart})`,
        timeZone,
      };
    } catch (err) {
      console.warn(`[CallingWindowGuard] Error resolving timezone ${timeZone}:`, err.message);
      return { dayOfWeek: 1, decimalHour: 12.0, formattedTime: '12:00 (Mon)', timeZone: 'UTC' };
    }
  }

  /**
   * Evaluates if a call or message is legally permitted right now.
   * Enforces TRAI (India), TCPA (USA), ACMA (Australia), and Global Standards.
   * 
   * @param {string} phoneNumber - Destination phone number
   * @param {string} [forcedIso] - Optional workspace or target ISO code
   * @returns {Object} { allowed: boolean, reason: string, queuedFor: string, meta: Object }
   */
  evaluate(phoneNumber, forcedIso = null, bypassCallingHours = false) {
    if (!phoneNumber) {
      return { allowed: false, reason: 'Destination phone number missing', queuedFor: null };
    }

    const countryMeta = forcedIso ? getCountryByIso(forcedIso) : getCountryByPhone(phoneNumber);
    const timeZone = this.resolveTimezone(phoneNumber, countryMeta);
    const { dayOfWeek, decimalHour, formattedTime } = this.getTimeDetailsInTimezone(timeZone);

    // Allow developer testing bypass during development or when explicit bypass flag is passed
    if (bypassCallingHours || process.env.BYPASS_CALLING_HOURS === 'true' || process.env.NODE_ENV === 'development') {
      return {
        allowed: true,
        status: 'DEV_BYPASS_ACTIVE',
        regulatoryBody: countryMeta.regulatoryBody,
        country: countryMeta.name,
        localTime: formattedTime,
        reason: 'Developer testing override active (Bypassing weekend & calling hours restrictions).',
      };
    }

    const rules = countryMeta.allowedHours || { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] };
    const { startHour, endHour, daysAllowed, satEndHour } = rules;

    // 1. Day of Week Check
    const isAllowedDay = daysAllowed ? daysAllowed.includes(dayOfWeek) : true;
    if (!isAllowedDay) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        allowed: false,
        status: 'BLOCKED_WEEKEND',
        regulatoryBody: countryMeta.regulatoryBody,
        country: countryMeta.name,
        localTime: formattedTime,
        reason: `${countryMeta.regulatoryBody} Guard: Outbound sales calls and cold messaging are legally prohibited on ${dayNames[dayOfWeek]}s in ${countryMeta.name}.`,
        queuedFor: 'Next business morning at 09:30 AM local time',
      };
    }

    // 2. Saturday Hour Check (if specific limit applies like ACMA Australia)
    if (dayOfWeek === 6 && satEndHour && decimalHour > satEndHour) {
      return {
        allowed: false,
        status: 'BLOCKED_SATURDAY_AFTERNOON',
        regulatoryBody: countryMeta.regulatoryBody,
        country: countryMeta.name,
        localTime: formattedTime,
        reason: `${countryMeta.regulatoryBody} Guard: Telemarketing calls on Saturdays are restricted after ${satEndHour}:00 in ${countryMeta.name}.`,
        queuedFor: 'Monday morning at 09:30 AM local time',
      };
    }

    // 3. Daily Calling Window Check (e.g. 9:30 AM to 6:30 PM in India, 8 AM to 8 PM in US)
    if (decimalHour < startHour || decimalHour >= endHour) {
      const startFmt = `${Math.floor(startHour)}:${Math.round((startHour % 1) * 60).toString().padStart(2, '0')}`;
      const endFmt = `${Math.floor(endHour)}:${Math.round((endHour % 1) * 60).toString().padStart(2, '0')}`;
      const isTooEarly = decimalHour < startHour;

      return {
        allowed: false,
        status: isTooEarly ? 'BLOCKED_TOO_EARLY' : 'BLOCKED_AFTER_HOURS',
        regulatoryBody: countryMeta.regulatoryBody,
        country: countryMeta.name,
        localTime: formattedTime,
        reason: `${countryMeta.regulatoryBody} Guard: Outbound sales calls to ${countryMeta.name} are legally restricted to ${startFmt} – ${endFmt} local time. Current lead time: ${formattedTime}.`,
        queuedFor: isTooEarly
          ? `Today at ${startFmt} local time`
          : `Tomorrow morning at ${startFmt} local time`,
      };
    }

    // Call Approved
    return {
      allowed: true,
      status: 'APPROVED',
      country: countryMeta.name,
      iso: countryMeta.iso,
      regulatoryBody: countryMeta.regulatoryBody,
      carrierEngine: countryMeta.carrierEngine,
      primaryChannel: countryMeta.primaryChannel,
      aiVoicePersona: countryMeta.aiVoicePersona,
      localTime: formattedTime,
      timezone: timeZone,
    };
  }
}

export const callingWindowGuard = new CallingWindowGuard();
export default callingWindowGuard;

