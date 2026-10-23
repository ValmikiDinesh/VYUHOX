import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Trash2,
  ExternalLink,
  ChevronDown,
  Filter,
  Sparkles,
} from 'lucide-react';

export default function LeadsView({
  leads = [],
  activeWorkspace,
  onOpenNewLeadModal,
  onOpenBulkImportModal,
  onUpdateLeadStage,
  onDeleteLead,
}) {
  const [activeStageFilter, setActiveStageFilter] = useState('ALL');
  const [activeSourceFilter, setActiveSourceFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const stages = [
    { id: 'ALL', label: 'All Leads' },
    { id: 'Prospect', label: 'Prospects' },
    { id: 'Contacted', label: 'Contacted' },
    { id: 'Qualified', label: 'Qualified' },
    { id: 'Demo_Booked', label: 'Demo Booked' },
    { id: 'Won', label: 'Won' },
    { id: 'Lost', label: 'Lost' },
  ];

  const sources = ['ALL', 'Scraper', 'Form', 'Ad', 'Inbound'];

  const filteredLeads = leads.filter((lead) => {
    const matchesStage = activeStageFilter === 'ALL' || lead.stage === activeStageFilter;
    const matchesSource = activeSourceFilter === 'ALL' || lead.source === activeSourceFilter;
    const matchesSearch =
      searchTerm === '' ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSource && matchesSearch;
  });

  const handleExportCSV = () => {
    window.open(`/api/leads/export/csv`, '_blank');
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '800' }}>
              Lead Finder & Pipeline CRM
            </h2>
            <span className="badge badge-cyan">{filteredLeads.length} Leads</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Waterfall-enriched prospects with omnichannel routing and automated qualification
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={onOpenBulkImportModal} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <Upload size={15} /> Bulk Import
          </button>
          <button onClick={onOpenNewLeadModal} className="btn-primary" style={{ padding: '8px 16px' }}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Stage Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {stages.map((stage) => {
            const count = stage.id === 'ALL' ? leads.length : leads.filter((l) => l.stage === stage.id).length;
            const isSelected = activeStageFilter === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageFilter(stage.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{stage.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Source filter row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name, company, job title, email..."
              className="input-glass"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>SOURCE:</span>
            {sources.map((src) => (
              <button
                key={src}
                onClick={() => setActiveSourceFilter(src)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: activeSourceFilter === src ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: activeSourceFilter === src ? '#F8FAFC' : '#94A3B8',
                  fontWeight: activeSourceFilter === src ? '600' : '400',
                }}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}>
                <th style={{ padding: '14px 20px' }}>Contact & Title</th>
                <th style={{ padding: '14px 16px' }}>Company</th>
                <th style={{ padding: '14px 16px' }}>Channels</th>
                <th style={{ padding: '14px 16px' }}>AI Score</th>
                <th style={{ padding: '14px 16px' }}>Source</th>
                <th style={{ padding: '14px 16px' }}>Stage Selector</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No leads found matching your criteria. Click "+ Add Lead" or use "Bulk Import".
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Contact Info */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38BDF8',
                          fontWeight: '700',
                        }}>
                          {lead.name.substring(0, 1)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#F8FAFC' }}>{lead.name}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>{lead.title || 'Executive'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td style={{ padding: '14px 16px', color: '#E2E8F0', fontWeight: '500' }}>
                      {lead.company || 'Direct'}
                    </td>

                    {/* Channels */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            title={`Email: ${lead.email}`}
                            style={{ color: '#38BDF8', display: 'flex', alignItems: 'center' }}
                          >
                            <Mail size={15} />
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            title={`Phone: ${lead.phone}`}
                            style={{ color: '#34D399', display: 'flex', alignItems: 'center' }}
                          >
                            <Phone size={15} />
                          </a>
                        )}
                        {lead.channels?.whatsapp && (
                          <span title={`WhatsApp: ${lead.channels.whatsapp}`} style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>
                            <MessageSquare size={15} />
                          </span>
                        )}
                        {lead.channels?.telegram && (
                          <span title={`Telegram: ${lead.channels.telegram}`} style={{ color: '#38BDF8', display: 'flex', alignItems: 'center' }}>
                            <Send size={15} />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AI Score */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '45px',
                          height: '6px',
                          borderRadius: '999px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${lead.score}%`,
                            height: '100%',
                            background: lead.score >= 80 ? '#10B981' : lead.score >= 60 ? '#06B6D4' : '#F59E0B',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: lead.score >= 80 ? '#34D399' : '#F8FAFC',
                        }}>
                          {lead.score}
                        </span>
                      </div>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-gray">{lead.source}</span>
                    </td>

                    {/* Stage Selector */}
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={lead.stage}
                        onChange={(e) => onUpdateLeadStage(lead._id, e.target.value)}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="Prospect">Prospect</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Demo_Booked">Demo Booked</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => onDeleteLead(lead._id)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Delete Lead"
                      >
                        <Trash2 size={13} color="#F43F5E" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
