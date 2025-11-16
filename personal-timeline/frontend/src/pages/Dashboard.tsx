import React, { useEffect, useMemo, useState } from 'react';
import '/src/index.css';

// If you already have a timeline context, you can swap this for it.
// For a drop‑in experience we read from the mock timelineService used earlier.
import { timelineService } from '../services/timelineService';
import type { TimelineEntry } from '../types/TimelineEntry';
import { useLocation, useNavigate } from 'react-router-dom';



const Card: React.FC<{ children: React.ReactNode; className?: string }>=({ children, className })=> (
  <div className={`dash-card ${className ?? ''}`}>{children}</div>
);

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function daysBetween(a: Date, b: Date) {
  return Math.floor((+a - +b) / (1000 * 60 * 60 * 24));
}

const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);


  useEffect(() => {
    if ((location.state as any)?.justSignedIn) {
      setShow(true);
      navigate('/dashboard', { replace: true, state: {} });
      const t = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(t);
    }
  }, [location.state, navigate]);



  useEffect(() => {
    (async () => {
      const { items } = await timelineService.list({ page: 1, pageSize: 200 });
      setEntries(items);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const thisMonth = entries.filter((e) => {
      const d = new Date(e.eventDate);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const achievements = entries.filter((e) => e.entryType === 'Achievement').length;
    const milestones = entries.filter((e) => e.entryType === 'Milestone').length;

    // Simple streak: count consecutive days back from today that have at least 1 entry
    const byDay = new Set(entries.map((e) => new Date(e.eventDate).toDateString()));
    let streak = 0;
    for (let i = 0; ; i++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      if (byDay.has(dt.toDateString())) streak++;
      else break;
    }

    // Source breakdown
    const bySource: Record<string, number> = {};
    for (const e of entries) bySource[e.sourceApi] = (bySource[e.sourceApi] ?? 0) + 1;
    const sourceArr = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

    return {
      total: entries.length,
      thisMonth: thisMonth.length,
      achievements,
      milestones,
      streak,
      sourceArr,
    };
  }, [entries]);

  const recent = useMemo(
    () => [...entries].sort((a, b) => +new Date(b.eventDate) - +new Date(a.eventDate)).slice(0, 6),
    [entries]
  );

  return (

    <div className="p-6">
      {show && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800">
          Signed in successfully!
        </div>
      )}
      {
        <div className="dash-wrap">
        {/* Header */}
        <header className="dash-hero">
          <div className="dash-logo">📊</div>
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Overview of your timeline and activity</p>
          </div>
        </header>
    
        {/* Stat tiles */}
        <section className="tiles">
          <div className="tile">
            <div className="tile-icon">📝</div>
            <div className="tile-value">{loading ? '—' : stats.total}</div>
            <div className="tile-label">Total Entries</div>
          </div>
          <div className="tile">
            <div className="tile-icon">🏆</div>
            <div className="tile-value">{loading ? '—' : stats.achievements}</div>
            <div className="tile-label">Achievements</div>
          </div>
          <div className="tile">
            <div className="tile-icon">🎯</div>
            <div className="tile-value">{loading ? '—' : stats.milestones}</div>
            <div className="tile-label">Milestones</div>
          </div>
          <div className="tile">
            <div className="tile-icon">📅</div>
            <div className="tile-value">{loading ? '—' : stats.thisMonth}</div>
            <div className="tile-label">This Month</div>
          </div>
          <div className="tile">
            <div className="tile-icon">🔥</div>
            <div className="tile-value">{loading ? '—' : stats.streak}</div>
            <div className="tile-label">Day Streak</div>
          </div>
        </section>
    
        {/* Body: recent list + sidebar */}
        <section className="dash-body">
          {/* Recent Activity (left) */}
          <div className="card">
            <div className="card-head">
              <span className="card-emoji">🗂️</span>
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <ul className="recent">
              {loading && <li className="muted">Loading…</li>}
              {!loading && recent.length === 0 && <li className="muted">No recent entries.</li>}
              {recent.map((e) => (
                <li key={e.id} className="recent-item">
                  <div className="recent-left">
                    <span className="pill" data-color={e.sourceApi}>
                      {e.sourceApi}
                    </span>
                    <div className="recent-title">{e.title}</div>
                    <div className="recent-meta">
                      {new Date(e.eventDate).toLocaleString()}
                      {e.entryType && <span>• {e.entryType}</span>}
                      {e.category && <span>• {e.category}</span>}
                    </div>
                  </div>
                  <div className="recent-right">
                    {e.externalUrl && (
                      <a className="link" href={e.externalUrl} target="_blank" rel="noreferrer">
                        Open ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
    
          {/* Sidebar (right) */}
          <aside className="side">
            <div className="card">
              <div className="card-head">
                <span className="card-emoji">🎯</span>
                <h2 className="card-title">Source Breakdown</h2>
              </div>
              <ul className="list">
                {stats.sourceArr.map(([source, count]) => (
                  <li key={source} className="list-row">
                    <span className="list-left">
                      <span className="dot" data-color={source}></span>
                      <span className="cap">{source}</span>
                    </span>
                    <span className="list-right">{count}</span>
                  </li>
                ))}
                {!loading && stats.sourceArr.length === 0 && <li className="muted">No sources yet.</li>}
              </ul>
            </div>
            <div className="side-actions">
              <a className="btn primary" href="/timeline">Go to Timeline</a>
              <a className="btn" href="/settings">Manage Connections</a>
            </div>
          </aside>
        </section>
      </div>
      }
    </div>
    // replace the return (...) of your Dashboard component with this:
  
);
};

export default Dashboard;
