export interface ApiConnection {
    id?: number;
    provider: 'github' | 'strava' | 'spotify' | 'todoist' | 'manual';
    isActive: boolean;
    lastSyncAt?: string | null;
    settings?: string | null; 
  }
  