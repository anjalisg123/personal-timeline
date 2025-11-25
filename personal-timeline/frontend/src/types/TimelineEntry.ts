export type EntryType = 'Achievement' | 'Activity' | 'Milestone' | 'Memory';
export type SourceApi = 'manual' | 'github' | 'strava' | 'spotify' | 'todoist';

export interface TimelineEntry {
  id: number;                 
  userId?: number;
  title: string;
  description?: string;       
  eventDate: string;          
  entryType: EntryType;       
  category?: string;
  imageUrl?: string;
  sourceApi?: SourceApi;
  externalId?: string;
  metadata?: string;          
  createdAt?: string;
  updatedAt?: string;
  externalUrl?: string;
  fileAttachment?: string;  // ADD THIS
  fileName?: string;         // ADD THIS  
  fileType?: string;         // ADD THIS
}