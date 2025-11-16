import { useEffect } from 'react';

export const usePageTitle = (title: string): void => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Timeline App`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};