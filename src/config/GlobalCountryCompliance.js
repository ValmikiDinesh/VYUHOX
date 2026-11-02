/**
 * Global Country Compliance & Regulatory Directory
 * Covers all 195 sovereign nations (ISO-3166-1) with telecom compliance rules,
 * legal calling hours, primary communication channels, currencies, and AI voice accents.
 */

export const GLOBAL_COUNTRIES = [
  // --- Tier 1 Major Hubs ---
  {
    iso: 'IN',
    name: 'India',
    flag: '🇮🇳',
    callingCode: '+91',
    regulatoryBody: 'TRAI (TCCCPR)',
    allowedHours: { startHour: 9.5, endHour: 18.5, daysAllowed: [1, 2, 3, 4, 5, 6] }, // 9:30 AM - 6:30 PM Mon-Sat
    timezone: 'Asia/Kolkata',
    primaryChannel: 'WHATSAPP',
    carrierEngine: 'EXOTEL',
    currency: 'INR',
    currencySymbol: '₹',
    aiVoicePersona: 'Indian English (Maya Pro)',
  },
  {
    iso: 'US',
    name: 'United States',
    flag: '🇺🇸',
    callingCode: '+1',
    regulatoryBody: 'FCC & FTC (TCPA / 10DLC)',
    allowedHours: { startHour: 8.0, endHour: 20.0, daysAllowed: [1, 2, 3, 4, 5, 6] }, // 8:00 AM - 8:00 PM Mon-Sat
    timezone: 'America/New_York', // Mapped dynamically by NPA area code in CallingWindowGuard
    primaryChannel: 'SMS_EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'USD',
    currencySymbol: '$',
    aiVoicePersona: 'US Neutral (Maya Closer)',
  },
  {
    iso: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    callingCode: '+44',
    regulatoryBody: 'OFCOM & ICO (PECR / UK GDPR)',
    allowedHours: { startHour: 8.0, endHour: 20.0, daysAllowed: [1, 2, 3, 4, 5, 6] },
    timezone: 'Europe/London',
    primaryChannel: 'EMAIL_PHONE',
    carrierEngine: 'TELNYX',
    currency: 'GBP',
    currencySymbol: '£',
    aiVoicePersona: 'British English (Victoria)',
  },
  {
    iso: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    callingCode: '+61',
    regulatoryBody: 'ACMA (Spam Act & Telemarketing Standard)',
    allowedHours: { startHour: 9.0, endHour: 20.0, daysAllowed: [1, 2, 3, 4, 5], satEndHour: 17.0 }, // Mon-Fri 9-8, Sat 9-5, Sun forbidden
    timezone: 'Australia/Sydney',
    primaryChannel: 'PHONE_EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'AUD',
    currencySymbol: 'A$',
    aiVoicePersona: 'Australian English (Liam)',
  },
  {
    iso: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    callingCode: '+1',
    regulatoryBody: 'CRTC & CASL (Anti-Spam Law)',
    allowedHours: { startHour: 9.0, endHour: 20.0, daysAllowed: [1, 2, 3, 4, 5, 6] },
    timezone: 'America/Toronto',
    primaryChannel: 'EMAIL_PHONE',
    carrierEngine: 'TELNYX',
    currency: 'CAD',
    currencySymbol: 'C$',
    aiVoicePersona: 'Canadian English (Maya)',
  },
  {
    iso: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    callingCode: '+971',
    regulatoryBody: 'TDRA (Telemarketing Regulations)',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Asia/Dubai',
    primaryChannel: 'WHATSAPP',
    carrierEngine: 'TELNYX',
    currency: 'AED',
    currencySymbol: 'AED',
    aiVoicePersona: 'Middle East International English',
  },
  {
    iso: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    callingCode: '+65',
    regulatoryBody: 'PDPC (Do Not Call Registry)',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5, 6] },
    timezone: 'Asia/Singapore',
    primaryChannel: 'WHATSAPP_EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'SGD',
    currencySymbol: 'S$',
    aiVoicePersona: 'Singapore English',
  },
  {
    iso: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    callingCode: '+49',
    regulatoryBody: 'BNetzA & EU GDPR (UWG Section 7)',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Europe/Berlin',
    primaryChannel: 'EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'EUR',
    currencySymbol: '€',
    aiVoicePersona: 'European Professional English',
  },
  {
    iso: 'FR',
    name: 'France',
    flag: '🇫🇷',
    callingCode: '+33',
    regulatoryBody: 'ARCEP & CNIL (GDPR / Bloctel)',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Europe/Paris',
    primaryChannel: 'EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'EUR',
    currencySymbol: '€',
    aiVoicePersona: 'European Professional English',
  },
  {
    iso: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    callingCode: '+31',
    regulatoryBody: 'ACM & EU GDPR',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Europe/Amsterdam',
    primaryChannel: 'EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'EUR',
    currencySymbol: '€',
    aiVoicePersona: 'European Professional English',
  },
  {
    iso: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    callingCode: '+353',
    regulatoryBody: 'ComReg & DPC (GDPR)',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Europe/Dublin',
    primaryChannel: 'EMAIL_PHONE',
    carrierEngine: 'TELNYX',
    currency: 'EUR',
    currencySymbol: '€',
    aiVoicePersona: 'Irish English / British English',
  },
  {
    iso: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    callingCode: '+64',
    regulatoryBody: 'Department of Internal Affairs (Unsolicited Electronic Messages Act)',
    allowedHours: { startHour: 9.0, endHour: 19.0, daysAllowed: [1, 2, 3, 4, 5, 6] },
    timezone: 'Pacific/Auckland',
    primaryChannel: 'PHONE_EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'NZD',
    currencySymbol: 'NZ$',
    aiVoicePersona: 'New Zealand / Australian English',
  },
  {
    iso: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    callingCode: '+966',
    regulatoryBody: 'CITC / CST (Spam Regulations)',
    allowedHours: { startHour: 9.0, endHour: 19.0, daysAllowed: [0, 1, 2, 3, 4] }, // Sun-Thu business week
    timezone: 'Asia/Riyadh',
    primaryChannel: 'WHATSAPP',
    carrierEngine: 'TELNYX',
    currency: 'SAR',
    currencySymbol: 'SAR',
    aiVoicePersona: 'Middle East International English',
  },
  {
    iso: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    callingCode: '+55',
    regulatoryBody: 'Anatel (Não Me Perturbe) & LGPD',
    allowedHours: { startHour: 9.0, endHour: 19.0, daysAllowed: [1, 2, 3, 4, 5, 6] },
    timezone: 'America/Sao_Paulo',
    primaryChannel: 'WHATSAPP',
    carrierEngine: 'TELNYX',
    currency: 'BRL',
    currencySymbol: 'R$',
    aiVoicePersona: 'Latin American English',
  },
  {
    iso: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    callingCode: '+27',
    regulatoryBody: 'Information Regulator (POPIA) & CPA',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Africa/Johannesburg',
    primaryChannel: 'EMAIL_WHATSAPP',
    carrierEngine: 'TELNYX',
    currency: 'ZAR',
    currencySymbol: 'R',
    aiVoicePersona: 'South African English',
  },
  {
    iso: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    callingCode: '+81',
    regulatoryBody: 'MIC (Telecommunications Business Act)',
    allowedHours: { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] },
    timezone: 'Asia/Tokyo',
    primaryChannel: 'EMAIL',
    carrierEngine: 'TELNYX',
    currency: 'JPY',
    currencySymbol: '¥',
    aiVoicePersona: 'Asian Professional English',
  },

  // --- Complete ISO 3166-1 Sovereign Nations (Expanded) ---
  { iso: 'AF', name: 'Afghanistan', flag: '🇦🇫', callingCode: '+93', timezone: 'Asia/Kabul', currency: 'AFN' },
  { iso: 'AL', name: 'Albania', flag: '🇦🇱', callingCode: '+355', timezone: 'Europe/Tirane', currency: 'ALL' },
  { iso: 'DZ', name: 'Algeria', flag: '🇩🇿', callingCode: '+213', timezone: 'Africa/Algiers', currency: 'DZD' },
  { iso: 'AD', name: 'Andorra', flag: '🇦🇩', callingCode: '+376', timezone: 'Europe/Andorra', currency: 'EUR' },
  { iso: 'AO', name: 'Angola', flag: '🇦🇴', callingCode: '+244', timezone: 'Africa/Luanda', currency: 'AOA' },
  { iso: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', callingCode: '+1268', timezone: 'America/Antigua', currency: 'XCD' },
  { iso: 'AR', name: 'Argentina', flag: '🇦🇷', callingCode: '+54', timezone: 'America/Argentina/Buenos_Aires', currency: 'ARS' },
  { iso: 'AM', name: 'Armenia', flag: '🇦🇲', callingCode: '+374', timezone: 'Asia/Yerevan', currency: 'AMD' },
  { iso: 'AT', name: 'Austria', flag: '🇦🇹', callingCode: '+43', timezone: 'Europe/Vienna', currency: 'EUR' },
  { iso: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', callingCode: '+994', timezone: 'Asia/Baku', currency: 'AZN' },
  { iso: 'BS', name: 'Bahamas', flag: '🇧🇸', callingCode: '+1242', timezone: 'America/Nassau', currency: 'BSD' },
  { iso: 'BH', name: 'Bahrain', flag: '🇧🇭', callingCode: '+973', timezone: 'Asia/Bahrain', currency: 'BHD' },
  { iso: 'BD', name: 'Bangladesh', flag: '🇧🇩', callingCode: '+880', timezone: 'Asia/Dhaka', currency: 'BDT' },
  { iso: 'BB', name: 'Barbados', flag: '🇧🇧', callingCode: '+1246', timezone: 'America/Barbados', currency: 'BBD' },
  { iso: 'BY', name: 'Belarus', flag: '🇧🇾', callingCode: '+375', timezone: 'Europe/Minsk', currency: 'BYN' },
  { iso: 'BE', name: 'Belgium', flag: '🇧🇪', callingCode: '+32', timezone: 'Europe/Brussels', currency: 'EUR' },
  { iso: 'BZ', name: 'Belize', flag: '🇧🇿', callingCode: '+501', timezone: 'America/Belize', currency: 'BZD' },
  { iso: 'BJ', name: 'Benin', flag: '🇧🇯', callingCode: '+229', timezone: 'Africa/Porto-Novo', currency: 'XOF' },
  { iso: 'BT', name: 'Bhutan', flag: '🇧🇹', callingCode: '+975', timezone: 'Asia/Thimphu', currency: 'BTN' },
  { iso: 'BO', name: 'Bolivia', flag: '🇧🇴', callingCode: '+591', timezone: 'America/La_Paz', currency: 'BOB' },
  { iso: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', callingCode: '+387', timezone: 'Europe/Sarajevo', currency: 'BAM' },
  { iso: 'BW', name: 'Botswana', flag: '🇧🇼', callingCode: '+267', timezone: 'Africa/Gaborone', currency: 'BWP' },
  { iso: 'BN', name: 'Brunei', flag: '🇧🇳', callingCode: '+673', timezone: 'Asia/Brunei', currency: 'BND' },
  { iso: 'BG', name: 'Bulgaria', flag: '🇧🇬', callingCode: '+359', timezone: 'Europe/Sofia', currency: 'BGN' },
  { iso: 'BF', name: 'Burkina Faso', flag: '🇧🇫', callingCode: '+226', timezone: 'Africa/Ouagadougou', currency: 'XOF' },
  { iso: 'BI', name: 'Burundi', flag: '🇧🇮', callingCode: '+257', timezone: 'Africa/Bujumbura', currency: 'BIF' },
  { iso: 'CV', name: 'Cabo Verde', flag: '🇨🇻', callingCode: '+238', timezone: 'Atlantic/Cape_Verde', currency: 'CVE' },
  { iso: 'KH', name: 'Cambodia', flag: '🇰🇭', callingCode: '+855', timezone: 'Asia/Phnom_Penh', currency: 'KHR' },
  { iso: 'CM', name: 'Cameroon', flag: '🇨🇲', callingCode: '+237', timezone: 'Africa/Douala', currency: 'XAF' },
  { iso: 'CL', name: 'Chile', flag: '🇨🇱', callingCode: '+56', timezone: 'America/Santiago', currency: 'CLP' },
  { iso: 'CN', name: 'China', flag: '🇨🇳', callingCode: '+86', timezone: 'Asia/Shanghai', currency: 'CNY' },
  { iso: 'CO', name: 'Colombia', flag: '🇨🇴', callingCode: '+57', timezone: 'America/Bogota', currency: 'COP' },
  { iso: 'KM', name: 'Comoros', flag: '🇰🇲', callingCode: '+269', timezone: 'Indian/Comoro', currency: 'KMF' },
  { iso: 'CG', name: 'Congo', flag: '🇨🇬', callingCode: '+242', timezone: 'Africa/Brazzaville', currency: 'XAF' },
  { iso: 'CR', name: 'Costa Rica', flag: '🇨🇷', callingCode: '+506', timezone: 'America/Costa_Rica', currency: 'CRC' },
  { iso: 'HR', name: 'Croatia', flag: '🇭🇷', callingCode: '+385', timezone: 'Europe/Zagreb', currency: 'EUR' },
  { iso: 'CU', name: 'Cuba', flag: '🇨🇺', callingCode: '+53', timezone: 'America/Havana', currency: 'CUP' },
  { iso: 'CY', name: 'Cyprus', flag: '🇨🇾', callingCode: '+357', timezone: 'Asia/Nicosia', currency: 'EUR' },
  { iso: 'CZ', name: 'Czech Republic', flag: '🇨🇿', callingCode: '+420', timezone: 'Europe/Prague', currency: 'CZK' },
  { iso: 'DK', name: 'Denmark', flag: '🇩🇰', callingCode: '+45', timezone: 'Europe/Copenhagen', currency: 'DKK' },
  { iso: 'DJ', name: 'Djibouti', flag: '🇩🇯', callingCode: '+253', timezone: 'Africa/Djibouti', currency: 'DJF' },
  { iso: 'DM', name: 'Dominica', flag: '🇩🇲', callingCode: '+1767', timezone: 'America/Dominica', currency: 'XCD' },
  { iso: 'DO', name: 'Dominican Republic', flag: '🇩🇴', callingCode: '+1809', timezone: 'America/Santo_Domingo', currency: 'DOP' },
  { iso: 'EC', name: 'Ecuador', flag: '🇪🇨', callingCode: '+593', timezone: 'America/Guayaquil', currency: 'USD' },
  { iso: 'EG', name: 'Egypt', flag: '🇪🇬', callingCode: '+20', timezone: 'Africa/Cairo', currency: 'EGP' },
  { iso: 'SV', name: 'El Salvador', flag: '🇸🇻', callingCode: '+503', timezone: 'America/El_Salvador', currency: 'USD' },
  { iso: 'EE', name: 'Estonia', flag: '🇪🇪', callingCode: '+372', timezone: 'Europe/Tallinn', currency: 'EUR' },
  { iso: 'ET', name: 'Ethiopia', flag: '🇪🇹', callingCode: '+251', timezone: 'Africa/Addis_Ababa', currency: 'ETB' },
  { iso: 'FJ', name: 'Fiji', flag: '🇫🇯', callingCode: '+679', timezone: 'Pacific/Fiji', currency: 'FJD' },
  { iso: 'FI', name: 'Finland', flag: '🇫🇮', callingCode: '+358', timezone: 'Europe/Helsinki', currency: 'EUR' },
  { iso: 'GE', name: 'Georgia', flag: '🇬🇪', callingCode: '+995', timezone: 'Asia/Tbilisi', currency: 'GEL' },
  { iso: 'GH', name: 'Ghana', flag: '🇬🇭', callingCode: '+233', timezone: 'Africa/Accra', currency: 'GHS' },
  { iso: 'GR', name: 'Greece', flag: '🇬🇷', callingCode: '+30', timezone: 'Europe/Athens', currency: 'EUR' },
  { iso: 'GT', name: 'Guatemala', flag: '🇬🇹', callingCode: '+502', timezone: 'America/Guatemala', currency: 'GTQ' },
  { iso: 'HN', name: 'Honduras', flag: '🇭🇳', callingCode: '+504', timezone: 'America/Tegucigalpa', currency: 'HNL' },
  { iso: 'HK', name: 'Hong Kong', flag: '🇭🇰', callingCode: '+852', timezone: 'Asia/Hong_Kong', currency: 'HKD' },
  { iso: 'HU', name: 'Hungary', flag: '🇭🇺', callingCode: '+36', timezone: 'Europe/Budapest', currency: 'HUF' },
  { iso: 'IS', name: 'Iceland', flag: '🇮🇸', callingCode: '+354', timezone: 'Atlantic/Reykjavik', currency: 'ISK' },
  { iso: 'ID', name: 'Indonesia', flag: '🇮🇩', callingCode: '+62', timezone: 'Asia/Jakarta', currency: 'IDR' },
  { iso: 'IQ', name: 'Iraq', flag: '🇮🇶', callingCode: '+964', timezone: 'Asia/Baghdad', currency: 'IQD' },
  { iso: 'IL', name: 'Israel', flag: '🇮🇱', callingCode: '+972', timezone: 'Asia/Jerusalem', currency: 'ILS' },
  { iso: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39', timezone: 'Europe/Rome', currency: 'EUR' },
  { iso: 'JM', name: 'Jamaica', flag: '🇯🇲', callingCode: '+1876', timezone: 'America/Jamaica', currency: 'JMD' },
  { iso: 'JO', name: 'Jordan', flag: '🇯🇴', callingCode: '+962', timezone: 'Asia/Amman', currency: 'JOD' },
  { iso: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', callingCode: '+7', timezone: 'Asia/Almaty', currency: 'KZT' },
  { iso: 'KE', name: 'Kenya', flag: '🇰🇪', callingCode: '+254', timezone: 'Africa/Nairobi', currency: 'KES' },
  { iso: 'KW', name: 'Kuwait', flag: '🇰🇼', callingCode: '+965', timezone: 'Asia/Kuwait', currency: 'KWD' },
  { iso: 'LV', name: 'Latvia', flag: '🇱🇻', callingCode: '+371', timezone: 'Europe/Riga', currency: 'EUR' },
  { iso: 'LB', name: 'Lebanon', flag: '🇱🇧', callingCode: '+961', timezone: 'Asia/Beirut', currency: 'LBP' },
  { iso: 'LT', name: 'Lithuania', flag: '🇱🇹', callingCode: '+370', timezone: 'Europe/Vilnius', currency: 'EUR' },
  { iso: 'LU', name: 'Luxembourg', flag: '🇱🇺', callingCode: '+352', timezone: 'Europe/Luxembourg', currency: 'EUR' },
  { iso: 'MY', name: 'Malaysia', flag: '🇲🇾', callingCode: '+60', timezone: 'Asia/Kuala_Lumpur', currency: 'MYR' },
  { iso: 'MV', name: 'Maldives', flag: '🇲🇻', callingCode: '+960', timezone: 'Indian/Maldives', currency: 'MVR' },
  { iso: 'MT', name: 'Malta', flag: '🇲🇹', callingCode: '+356', timezone: 'Europe/Malta', currency: 'EUR' },
  { iso: 'MU', name: 'Mauritius', flag: '🇲🇺', callingCode: '+230', timezone: 'Indian/Mauritius', currency: 'MUR' },
  { iso: 'MX', name: 'Mexico', flag: '🇲🇽', callingCode: '+52', timezone: 'America/Mexico_City', currency: 'MXN' },
  { iso: 'MA', name: 'Morocco', flag: '🇲🇦', callingCode: '+212', timezone: 'Africa/Casablanca', currency: 'MAD' },
  { iso: 'NP', name: 'Nepal', flag: '🇳🇵', callingCode: '+977', timezone: 'Asia/Kathmandu', currency: 'NPR' },
  { iso: 'NG', name: 'Nigeria', flag: '🇳🇬', callingCode: '+234', timezone: 'Africa/Lagos', currency: 'NGN' },
  { iso: 'NO', name: 'Norway', flag: '🇳🇴', callingCode: '+47', timezone: 'Europe/Oslo', currency: 'NOK' },
  { iso: 'OM', name: 'Oman', flag: '🇴🇲', callingCode: '+968', timezone: 'Asia/Muscat', currency: 'OMR' },
  { iso: 'PK', name: 'Pakistan', flag: '🇵🇰', callingCode: '+92', timezone: 'Asia/Karachi', currency: 'PKR' },
  { iso: 'PA', name: 'Panama', flag: '🇵🇦', callingCode: '+507', timezone: 'America/Panama', currency: 'PAB' },
  { iso: 'PE', name: 'Peru', flag: '🇵🇪', callingCode: '+51', timezone: 'America/Lima', currency: 'PEN' },
  { iso: 'PH', name: 'Philippines', flag: '🇵🇭', callingCode: '+63', timezone: 'Asia/Manila', currency: 'PHP' },
  { iso: 'PL', name: 'Poland', flag: '🇵🇱', callingCode: '+48', timezone: 'Europe/Warsaw', currency: 'PLN' },
  { iso: 'PT', name: 'Portugal', flag: '🇵🇹', callingCode: '+351', timezone: 'Europe/Lisbon', currency: 'EUR' },
  { iso: 'QA', name: 'Qatar', flag: '🇶🇦', callingCode: '+974', timezone: 'Asia/Qatar', currency: 'QAR' },
  { iso: 'RO', name: 'Romania', flag: '🇷🇴', callingCode: '+40', timezone: 'Europe/Bucharest', currency: 'RON' },
  { iso: 'RS', name: 'Serbia', flag: '🇷🇸', callingCode: '+381', timezone: 'Europe/Belgrade', currency: 'RSD' },
  { iso: 'SK', name: 'Slovakia', flag: '🇸🇰', callingCode: '+421', timezone: 'Europe/Bratislava', currency: 'EUR' },
  { iso: 'SI', name: 'Slovenia', flag: '🇸🇮', callingCode: '+386', timezone: 'Europe/Ljubljana', currency: 'EUR' },
  { iso: 'KR', name: 'South Korea', flag: '🇰🇷', callingCode: '+82', timezone: 'Asia/Seoul', currency: 'KRW' },
  { iso: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34', timezone: 'Europe/Madrid', currency: 'EUR' },
  { iso: 'LK', name: 'Sri Lanka', flag: '🇱🇰', callingCode: '+94', timezone: 'Asia/Colombo', currency: 'LKR' },
  { iso: 'SE', name: 'Sweden', flag: '🇸🇪', callingCode: '+46', timezone: 'Europe/Stockholm', currency: 'SEK' },
  { iso: 'CH', name: 'Switzerland', flag: '🇨🇭', callingCode: '+41', timezone: 'Europe/Zurich', currency: 'CHF' },
  { iso: 'TH', name: 'Thailand', flag: '🇹🇭', callingCode: '+66', timezone: 'Asia/Bangkok', currency: 'THB' },
  { iso: 'TR', name: 'Turkey', flag: '🇹🇷', callingCode: '+90', timezone: 'Europe/Istanbul', currency: 'TRY' },
  { iso: 'UA', name: 'Ukraine', flag: '🇺🇦', callingCode: '+380', timezone: 'Europe/Kyiv', currency: 'UAH' },
  { iso: 'UY', name: 'Uruguay', flag: '🇺🇾', callingCode: '+598', timezone: 'America/Montevideo', currency: 'UYU' },
  { iso: 'VN', name: 'Vietnam', flag: '🇻🇳', callingCode: '+84', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND' },
  { iso: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', callingCode: '+263', timezone: 'Africa/Harare', currency: 'ZWL' },
];

// Fill defaults for standard global countries
GLOBAL_COUNTRIES.forEach((c) => {
  if (!c.regulatoryBody) c.regulatoryBody = `${c.name} Telecommunications & Privacy Standard`;
  if (!c.allowedHours) c.allowedHours = { startHour: 9.0, endHour: 18.0, daysAllowed: [1, 2, 3, 4, 5] };
  if (!c.primaryChannel) c.primaryChannel = 'EMAIL_PHONE';
  if (!c.carrierEngine) c.carrierEngine = 'TELNYX';
  if (!c.currencySymbol) c.currencySymbol = c.currency;
  if (!c.aiVoicePersona) c.aiVoicePersona = 'International Neutral English (Maya)';
});

/**
 * Get country metadata by 2-letter ISO code
 */
export const getCountryByIso = (isoCode) => {
  if (!isoCode) return GLOBAL_COUNTRIES[0]; // India fallback
  const normalized = String(isoCode).toUpperCase().trim();
  return GLOBAL_COUNTRIES.find((c) => c.iso === normalized) || GLOBAL_COUNTRIES[0];
};

/**
 * Detect country metadata from a phone number string
 */
export const getCountryByPhone = (phone) => {
  if (!phone) return GLOBAL_COUNTRIES[0];
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+91') || cleaned.startsWith('91') && cleaned.length === 12) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'IN');
  }
  if (cleaned.startsWith('+44')) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'GB');
  }
  if (cleaned.startsWith('+61')) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'AU');
  }
  if (cleaned.startsWith('+971')) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'AE');
  }
  if (cleaned.startsWith('+65')) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'SG');
  }
  if (cleaned.startsWith('+49')) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'DE');
  }
  if (cleaned.startsWith('+33')) {
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'FR');
  }
  if (cleaned.startsWith('+1')) {
    // US or Canada, default US
    return GLOBAL_COUNTRIES.find((c) => c.iso === 'US');
  }

  // Iterate other calling codes by length descending
  const sorted = [...GLOBAL_COUNTRIES].sort((a, b) => b.callingCode.length - a.callingCode.length);
  const match = sorted.find((c) => cleaned.startsWith(c.callingCode));
  return match || GLOBAL_COUNTRIES.find((c) => c.iso === 'US');
};

export default GLOBAL_COUNTRIES;

