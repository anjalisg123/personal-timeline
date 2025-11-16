import React, { useState } from 'react';
import { useTimelineContext } from '../../context/TimelineContext';

const EntryFilter: React.FC = () => {
  const { filters, setFilters } = useTimelineContext();
  const [local, setLocal] = useState(filters);

  const apply = () => setFilters(local);
  const reset = () => { setLocal({}); setFilters({}); };

  

  return (
    <div className="entry-filter bg-white border">
      <div className="tl-row">
        <div>
          <label className="block text-xs text-gray-500">Search</label>
          <input
            className="tl-input w-full"
            placeholder="Search entries…"
            value={local.search ?? ''}
            onChange={(e) => setLocal({ ...local, search: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500">Type</label>
          <select
            className="tl-select w-full"
            value={local.type ?? ''}
            onChange={(e) => setLocal({ ...local, type: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option>Achievement</option>
            <option>Activity</option>
            <option>Milestone</option>
            <option>Memory</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500">Source</label>
          <select
            className="tl-select w-full"
            value={local.source ?? ''}
            onChange={(e) => setLocal({ ...local, source: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option value="manual">Manual</option>
            <option value="github">GitHub</option>
            <option value="strava">Strava</option>
            <option value="spotify">Spotify</option>
            <option value="todoist">Todoist</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500">From</label>
          <input
            type="date"
            className="tl-date w-full"
            value={local.from ?? ''}
            onChange={(e) => setLocal({ ...local, from: e.target.value || undefined })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500">To</label>
          <input
            type="date"
            className="tl-date w-full"
            value={local.to ?? ''}
            onChange={(e) => setLocal({ ...local, to: e.target.value || undefined })}
          />
        </div>

        <div className="tl-actions">
          <button className="tl-btn primary" onClick={apply}>Apply</button>
          <button className="tl-btn" onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default EntryFilter;
