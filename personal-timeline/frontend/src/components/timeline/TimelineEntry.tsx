import React, { useState } from 'react';
import type { TimelineEntry as T } from '../../types/TimelineEntry';
import { API_BASE } from '../../lib/api';

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="tl-pill">{children}</span>
);

function SourceIcon({ source }: { source: T['sourceApi'] }) {
  const map: Record<string, string> = { github: '💻', strava: '🏃', spotify: '🎵', todoist: '📝', manual: '🧷' };
  return <span>{map[source ?? "manual"] ?? '🔗'}</span>;
}

type Props = { entry: T; onEdit?: (e: T) => void; onDelete?: (id: number) => void };

const TimelineEntry: React.FC<Props> = ({ entry, onEdit, onDelete }) => {
  const [showMeta, setShowMeta] = useState(false); 

  const handleDelete = () => {
    if (!onDelete) return;
    const ok = window.confirm(`Delete “${entry.title}”? This can’t be undone.`);
    if (ok) onDelete(entry.id as number);
  };

  const hasAttachment = !!entry.fileAttachment;
  const isImage = entry.fileType?.startsWith('image/');

  const resolveUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('https')) return path;
    return `${API_BASE}${path}`;
  };

  const displayUrl = resolveUrl(entry.fileAttachment || entry.imageUrl);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const normalized = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
    return new Date(normalized).toLocaleString();
  };

  // --- NEW: Parse Metadata Logic ---
  let metaData: Record<string, any> | null = null;
  try {
    if (entry.metadata && entry.metadata !== '{}') {
      const parsed = JSON.parse(entry.metadata);
      if (Object.keys(parsed).length > 0) {
        metaData = parsed;
      }
    }
  } catch (e) {
    // invalid json, ignore
  }


  return (
    <article className="tl-entry">
      <div className="tl-left">
        <div className="tl-icon" data-source={entry.sourceApi}>
          <SourceIcon source={entry.sourceApi} />
        </div>
        <time className="tl-datepill">
          {formatDate(entry.eventDate)}
        </time>
      </div>

      <div className="tl-main">
        <h3 className="tl-title">{entry.title}</h3>
        {entry.description && <p className="tl-desc">{entry.description}</p>}
        <div className="tl-badges">
          {entry.entryType && <Pill>{entry.entryType}</Pill>}
          {entry.category && <Pill>{entry.category}</Pill>}
        </div>

        {/* --- NEW: Metadata Panel --- */}
        {showMeta && metaData && (
          <div style={{
            marginTop: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
              Entry Metadata
            </h4>
            {Object.entries(metaData).map(([key, value]) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span style={{ color: '#334155', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* --------------------------- */}
      </div>

      <div className="tl-actions">
        {entry.externalUrl && (
          <a className="tl-btn tl-btn-link" href={entry.externalUrl} target="_blank" rel="noreferrer">
            View source
          </a>
        )}

        {/* --- NEW: Metadata Toggle Button --- */}
        {metaData && (
          <button 
            className="tl-btn tl-btn-ghost" 
            onClick={() => setShowMeta(!showMeta)}
          >
            {showMeta ? "Hide Data" : "View Data"}
          </button>
        )}
        {/* ----------------------------------- */}

        {hasAttachment && (
          <a 
            className="tl-btn tl-btn-link" 
            href={displayUrl} 
            target="_blank" 
            rel="noreferrer"
          >
            {isImage ? "View Image" : "View File"}
          </a>
        )}

        {onEdit && <button className="tl-btn" onClick={() => onEdit(entry)}>Edit</button>}
        {onDelete && <button className="tl-btn" onClick={handleDelete}>Delete</button>}
      </div>
    </article>
  );
};

export default TimelineEntry;