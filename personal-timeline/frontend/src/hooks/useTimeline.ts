import { useEffect } from 'react';
import { useTimelineContext } from '../context/TimelineContext';

export const useTimeline = () => {
  const ctx = useTimelineContext();
  useEffect(() => {
    ctx.refresh();
    
  }, [ctx.filters]);
  return ctx;
};