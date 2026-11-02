import React, { useState, useEffect, useRef } from 'react';
import { Phone, ChevronDown, Search, Check } from 'lucide-react';

// Common country list with flags & calling codes (covers primary markets + global options)
export const POPULAR_COUNTRIES = [
  { iso: 'IN', name: 'India', flag: '🇮🇳', code: '+91' },
  { iso: 'US', name: 'United States', flag: '🇺🇸', code: '+1' },
  { iso: 'GB', name: 'United Kingdom', flag: '🇬🇧', code: '+44' },
  { iso: 'AU', name: 'Australia', flag: '🇦🇺', code: '+61' },
  { iso: 'CA', name: 'Canada', flag: '🇨🇦', code: '+1' },
  { iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', code: '+971' },
  { iso: 'SG', name: 'Singapore', flag: '🇸🇬', code: '+65' },
  { iso: 'DE', name: 'Germany', flag: '🇩🇪', code: '+49' },
  { iso: 'FR', name: 'France', flag: '🇫🇷', code: '+33' },
  { iso: 'NL', name: 'Netherlands', flag: '🇳🇱', code: '+31' },
  { iso: 'IE', name: 'Ireland', flag: '🇮🇪', code: '+353' },
  { iso: 'NZ', name: 'New Zealand', flag: '🇳🇿', code: '+64' },
  { iso: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', code: '+966' },
  { iso: 'ZA', name: 'South Africa', flag: '🇿🇦', code: '+27' },
  { iso: 'BR', name: 'Brazil', flag: '🇧🇷', code: '+55' },
  { iso: 'JP', name: 'Japan', flag: '🇯🇵', code: '+81' },
  { iso: 'CH', name: 'Switzerland', flag: '🇨🇭', code: '+41' },
  { iso: 'SE', name: 'Sweden', flag: '🇸🇪', code: '+46' },
  { iso: 'ES', name: 'Spain', flag: '🇪🇸', code: '+34' },
  { iso: 'IT', name: 'Italy', flag: '🇮🇹', code: '+39' },
  { iso: 'MY', name: 'Malaysia', flag: '🇲🇾', code: '+60' },
  { iso: 'ID', name: 'Indonesia', flag: '🇮🇩', code: '+62' },
  { iso: 'PH', name: 'Philippines', flag: '🇵🇭', code: '+63' },
  { iso: 'VN', name: 'Vietnam', flag: '🇻🇳', code: '+84' },
  { iso: 'MX', name: 'Mexico', flag: '🇲🇽', code: '+52' },
  { iso: 'QA', name: 'Qatar', flag: '🇶🇦', code: '+974' },
  { iso: 'KW', name: 'Kuwait', flag: '🇰🇼', code: '+965' },
  { iso: 'OM', name: 'Oman', flag: '🇴🇲', code: '+968' },
  { iso: 'BH', name: 'Bahrain', flag: '🇧🇭', code: '+973' },
];

/**
 * Detect default country code from browser's local timezone
 */
const detectDefaultCountry = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) return 'IN';
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Denver') || tz.includes('Los_Angeles') || tz.includes('Phoenix')) return 'US';
    if (tz.includes('London')) return 'GB';
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth')) return 'AU';
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) return 'CA';
    if (tz.includes('Dubai')) return 'AE';
    if (tz.includes('Singapore')) return 'SG';
    if (tz.includes('Berlin')) return 'DE';
    if (tz.includes('Paris')) return 'FR';
    if (tz.includes('Auckland')) return 'NZ';
    if (tz.includes('Riyadh')) return 'SA';
    if (tz.includes('Sao_Paulo')) return 'BR';
    if (tz.includes('Tokyo')) return 'JP';
  } catch (e) {}
  return 'IN';
};

/**
 * PhoneInputWithCountry
 * Clean, standard phone selector with flag dropdown, international dialing code, and E.164 normalization.
 */
export default function PhoneInputWithCountry({
  value = '',
  onChange,
  disabled = false,
  required = true,
  placeholder = '98765 43210',
  id = 'phone-input',
}) {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const defaultIso = detectDefaultCountry();
    return POPULAR_COUNTRIES.find((c) => c.iso === defaultIso) || POPULAR_COUNTRIES[0];
  });

  const [rawNumber, setRawNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Parse initial value if passed with country code
  useEffect(() => {
    if (value && typeof value === 'string') {
      const clean = value.replace(/[^\d+]/g, '');
      const match = POPULAR_COUNTRIES.find((c) => clean.startsWith(c.code));
      if (match) {
        setSelectedCountry(match);
        setRawNumber(clean.slice(match.code.length));
      } else {
        setRawNumber(clean);
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    // Emit new E.164 phone string
    const cleanDigits = rawNumber.replace(/[^\d]/g, '');
    const fullNumber = cleanDigits ? `${country.code}${cleanDigits}` : '';
    if (onChange) onChange(fullNumber, country);
  };

  const handleNumberChange = (e) => {
    const inputDigits = e.target.value.replace(/[^\d]/g, '');
    setRawNumber(inputDigits);
    const fullNumber = inputDigits ? `${selectedCountry.code}${inputDigits}` : '';
    if (onChange) onChange(fullNumber, selectedCountry);
  };

  const filteredCountries = POPULAR_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
          height: '42px',
        }}
      >
        {/* Country Code & Flag Selector Dropdown Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 10px',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#F8FAFC',
            fontSize: '0.84rem',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
          title="Select country code"
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
          <ChevronDown size={13} color="#94A3B8" />
        </button>

        {/* Local Number Input Field */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Phone size={14} color="#64748B" style={{ position: 'absolute', left: '10px' }} />
          <input
            id={id}
            type="tel"
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            value={rawNumber}
            onChange={handleNumberChange}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              paddingLeft: '32px',
              paddingRight: '12px',
              color: '#F8FAFC',
              fontSize: '0.86rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Country Selection Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '280px',
            maxHeight: '260px',
            background: '#0B132B',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <Search size={14} color="#64748B" />
            <input
              type="text"
              autoFocus
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                outline: 'none',
              }}
            />
          </div>

          {/* List of Countries */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredCountries.map((c) => {
              const isSelected = c.iso === selectedCountry.iso;
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    color: isSelected ? '#38BDF8' : '#CBD5E1',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>{c.code}</span>
                    {isSelected && <Check size={12} color="#38BDF8" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
