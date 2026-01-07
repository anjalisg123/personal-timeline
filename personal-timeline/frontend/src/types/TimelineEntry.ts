export type EntryType = 'Achievement' | 'Activity' | 'Milestone' | 'Memory'| 'Note';
export type SourceApi = 'manual' | 'github' | 'strava' | 'spotify' | 'todoist' ;

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
  fileAttachment?: string;  
  fileName?: string;         
  fileType?: string;         
}