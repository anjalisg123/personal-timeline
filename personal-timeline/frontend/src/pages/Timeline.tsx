// import React from 'react';
// import { TimelineProvider } from '../context/TimelineContext';
// import TimelineView from '../components/timeline/TimelineView';

// const TimelinePage: React.FC = () => (
//   <TimelineProvider>
//     <TimelineView />
//   </TimelineProvider>
// );

// export default TimelinePage;



import React, { useEffect, useState } from "react";
import { listEntries, type Entry } from "../services/entries";

const Timeline: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading timeline…</p>;
  if (err)     return <p>Failed to load: {err}</p>;
  if (!entries.length) return <p>No entries yet.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {entries.map((e) => (
        <li key={e.id} style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <strong>{e.title}</strong>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {new Date(e.eventDate).toLocaleDateString()}
              </div>
              {e.description && <p style={{ marginTop: 6 }}>{e.description}</p>}
              {e.externalUrl && (
                <a href={e.externalUrl} target="_blank" rel="noreferrer">Open link</a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Timeline;
