export interface ApiConnection {
    id?: number;
    provider: 'github' | 'strava' | 'spotify'  | 'manual';
    isActive: boolean;
    lastSyncAt?: string | null;
    settings?: string | null; 
  }
  