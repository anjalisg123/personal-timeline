import { useEffect } from 'react';
import { useTimelineContext } from '../context/TimelineContext';

export const useTimeline = () => {
  const ctx = useTimelineContext();
  useEffect(() => {
    ctx.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.filters]);
  return ctx;
};