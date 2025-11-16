// export interface ApiConnection {
//     provider: 'github' | 'strava' | 'spotify' | 'todoist';
//     isActive: boolean;
//     lastSyncAt?: string; // ISO
//     settings?: Record<string, any>;
// }


export interface ApiConnection {
    id?: number;
    provider: 'github' | 'strava' | 'spotify' | 'todoist' | 'manual';
    isActive: boolean;
    lastSyncAt?: string | null;
    settings?: string | null; // raw JSON string from server
  }
  