// import React from 'react';
// import type { TimelineEntry as T } from '../../types/TimelineEntry';

// const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <span className="tl-pill">{children}</span>
// );

// function SourceIcon({ source }: { source: T['sourceApi'] }) {
//   const map: Record<string, string> = { github: '💻', strava: '🏃', spotify: '🎵', todoist: '📝', manual: '🧷' };
//   return <span>{map[source] ?? '🔗'}</span>;
// }

// type Props = { entry: T; onEdit?: (e: T) => void; onDelete?: (id: string ) => void };

// const TimelineEntry: React.FC<Props> = ({ entry, onEdit, onDelete }) => {
//   const handleDelete = () => {
//     if (!onDelete) return;
//     const ok = window.confirm(`Delete “${entry.title}”? This can’t be undone.`);
//     if (ok) onDelete(String(entry.id));
//   };
//   return (
//     <article className="tl-entry">
//       {/* LEFT: icon + date pill */}
//       <div className="tl-left">
//         {/* NEW: data-source attr lets CSS tint the icon */}
//         <div className="tl-icon" data-source={entry.sourceApi}>
//           <SourceIcon source={entry.sourceApi} />
//         </div>

//         {/* NEW: use tl-datepill for the rounded capsule look */}
//         <time className="tl-datepill">
//           {new Date(entry.eventDate).toLocaleString()}
//         </time>
//       </div>

//       {/* CENTER: content */}
//       <div className="tl-main">
//         <h3 className="tl-title">{entry.title}</h3>
//         {entry.description && <p className="tl-desc">{entry.description}</p>}

//         <div className="tl-badges">
//           <Pill>{entry.entryType}</Pill>
//           {entry.category && <Pill>{entry.category}</Pill>}
//         </div>

//         {entry.imageUrl && <img className="tl-image" src={entry.imageUrl} alt="" loading="lazy" />}
//       </div>

//       {/* RIGHT: actions */}
//       <div className="tl-actions">
//         {entry.externalUrl && (
//           <a className="tl-btn tl-btn-link" href={entry.externalUrl} target="_blank" rel="noreferrer">View source</a>
//         )}
//         {onEdit && <button className="tl-btn" onClick={() => onEdit(entry)}>Edit</button>}
//         {onDelete && <button className="tl-btn" onClick={() => onDelete(entry.id)}>Delete</button>}
//       </div>
//     </article>
//   );
// };

// export default TimelineEntry;





import React from 'react';
import type { TimelineEntry as T } from '../../types/TimelineEntry';

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="tl-pill">{children}</span>
);

function SourceIcon({ source }: { source: T['sourceApi'] }) {
  const map: Record<string, string> = { github: '💻', strava: '🏃', spotify: '🎵', todoist: '📝', manual: '🧷' };
  return <span>{map[source ?? "manual"] ?? '🔗'}</span>;
}

type Props = { entry: T; onEdit?: (e: T) => void; onDelete?: (id: number) => void };

const TimelineEntry: React.FC<Props> = ({ entry, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (!onDelete) return;
    const ok = window.confirm(`Delete “${entry.title}”? This can’t be undone.`);
    if (ok) onDelete(entry.id as number);
  };

  return (
    <article className="tl-entry">
      <div className="tl-left">
        <div className="tl-icon" data-source={entry.sourceApi}>
          <SourceIcon source={entry.sourceApi} />
        </div>
        <time className="tl-datepill">
          {new Date(entry.eventDate).toLocaleString()}
        </time>
      </div>

      <div className="tl-main">
        <h3 className="tl-title">{entry.title}</h3>
        {entry.description && <p className="tl-desc">{entry.description}</p>}
        <div className="tl-badges">
          {entry.entryType && <Pill>{entry.entryType}</Pill>}
          {entry.category && <Pill>{entry.category}</Pill>}
        </div>
        {entry.imageUrl && <img className="tl-image" src={entry.imageUrl} alt="" loading="lazy" />}
      </div>

      <div className="tl-actions">
        {entry.externalUrl && (
          <a className="tl-btn tl-btn-link" href={entry.externalUrl} target="_blank" rel="noreferrer">View source</a>
        )}
        {onEdit && <button className="tl-btn" onClick={() => onEdit(entry)}>Edit</button>}
        {onDelete && <button className="tl-btn" onClick={handleDelete}>Delete</button>}
      </div>
    </article>
  );
};

export default TimelineEntry;
