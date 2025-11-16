export type EntryType = 'Achievement' | 'Activity' | 'Milestone' | 'Memory';
export type SourceApi = 'manual' | 'github' | 'strava' | 'spotify' | 'todoist';

export interface TimelineEntry {
  id: number;                 // numeric now
  userId?: number;
  title: string;
  description?: string;       // can be empty string in DB
  eventDate: string;          // ISO string
  entryType: EntryType;       // string union (server stores string)
  category?: string;
  imageUrl?: string;
  sourceApi?: SourceApi;
  externalId?: string;
  metadata?: string;          // JSON string in professor model
  createdAt?: string;
  updatedAt?: string;
  externalUrl?: string;
}