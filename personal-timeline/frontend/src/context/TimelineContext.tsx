import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import type { TimelineEntry } from '../types/TimelineEntry';
import { timelineService } from '../services/timelineService';


export interface TimelineFilters {
  search?: string;
  type?: string;
  source?: string;
  from?: string;
  to?: string;
}

type TimelineState = {
  entries: TimelineEntry[];
  total: number;
  loading: boolean;
  filters: TimelineFilters;
  setFilters: (f: TimelineFilters) => void;
  refresh: () => Promise<void>;
  add: (e: Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, patch: Partial<TimelineEntry>) => Promise<void>;
  remove: (id: string) => Promise<void>;

};

const TimelineContext = createContext<TimelineState | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<TimelineFilters>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items, total } = await timelineService.list({ ...filters, page: 1, pageSize: 50 });
    setEntries(items);
    setTotal(total);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    // initial load + whenever filters change
    refresh();
  }, [refresh]);

  const add = async (e: Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    await timelineService.create(e);
    await refresh();
  };

  const update = async (id: string, patch: Partial<TimelineEntry>) => {
    await timelineService.update(id, patch);
    await refresh();
  };

  const remove = async (id: string) => {
    // Optimistic UI: drop it locally right away
    setEntries(prev => prev.filter(e => String(e.id) !== String(id)));
    try {
      await timelineService.remove(id);
    } catch (err) {
      // If API fails, reload from server to recover the UI
      await refresh();
      throw err;
    }
    // Optional: finalize with a fresh read (keeps UI consistent if server mutates other fields)
    await refresh();
  };

  const value = useMemo(
    () => ({ entries, total, loading, filters, setFilters, refresh, add, update, remove }),
    [entries, total, loading, filters, refresh]
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

export const useTimelineContext = () => {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('useTimelineContext must be used within TimelineProvider');
  return ctx;
};
