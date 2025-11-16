import type { TimelineEntry } from '../types/TimelineEntry';

let mockEntries: TimelineEntry[] = [
  {
    id: 101,
    userId: 1,
    title: 'Merged PR #42 in assignment-5-anjalisg123',
    description: 'Refactored EF Core context and fixed failing tests',
    eventDate: '2025-10-28T22:14:00Z',
    entryType: 'Achievement',
    category: 'Code',
    externalUrl: 'https://github.com/anjalisg123/assignment-5-anjalisg123/pull/42',
    sourceApi: 'github',
    externalId: 'pr_42',
    metadata: { repo: 'assignment-5-anjalisg123', linesChanged: 183 },
    createdAt: '2025-10-28T22:15:00Z',
    updatedAt: '2025-10-28T22:15:00Z',
  },
  {
    id: 102,
    userId: 1,
    title: 'Evening Run — 5.2 km',
    description: 'Felt strong, easy pace',
    eventDate: '2025-10-27T23:05:00Z',
    entryType: 'Activity',
    category: 'Fitness',
    imageUrl: '/assets/strava-map.png',
    sourceApi: 'strava',
    externalId: 'activity_987654',
    metadata: { distance_km: 5.2, pace_per_km: '6:12', duration_min: 32 },
    createdAt: '2025-10-27T23:06:00Z',
    updatedAt: '2025-10-27T23:06:00Z',
  },
  {
    id: 103,
    userId: 1,
    title: 'Liked a track: Blinding Lights',
    description: 'The Weeknd',
    eventDate: '2025-10-26T18:20:00Z',
    entryType: 'Activity',
    category: 'Music',
    imageUrl: '/assets/blinding-lights.jpg',
    sourceApi: 'spotify',
    externalId: 'track_123',
    metadata: { artist: 'The Weeknd', album: 'After Hours' },
    createdAt: '2025-10-26T18:21:00Z',
    updatedAt: '2025-10-26T18:21:00Z',
  },
];

export const timelineService = {
  async list(params?: {
    search?: string;
    type?: string;
    source?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: TimelineEntry[]; total: number }> {
    let items = [...mockEntries].sort((a, b) => +new Date(b.eventDate) - +new Date(a.eventDate));
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((e) => `${e.title} ${e.description ?? ''}`.toLowerCase().includes(q));
    }

    if (params?.type && params.type !== "All") {
      items = items.filter(e => e.entryType === params.type);
    }
    if (params?.source && params.source !== "All") {
      items = items.filter(e => e.sourceApi === params.source);
    }
    if (params?.from) items = items.filter(e => new Date(e.eventDate) >= new Date(params.from));
    if (params?.to)   items = items.filter(e => new Date(e.eventDate) <= new Date(params.to));
   
    const total = items.length;
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total };
  },
  async get(id: number) {
    return mockEntries.find((e) => e.id === id) ?? null;
  },
  async create(entry: Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const newEntry: TimelineEntry = { ...entry, id: Math.floor(Math.random() * 1e6), createdAt: now, updatedAt: now };
    mockEntries.push(newEntry);
    return newEntry;
  },
  async update(id: number, patch: Partial<TimelineEntry>) {
    const idx = mockEntries.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Not found');
    mockEntries[idx] = { ...mockEntries[idx], ...patch, updatedAt: new Date().toISOString() };
    return mockEntries[idx];
  },
  async remove(id: number) {
    mockEntries = mockEntries.filter((e) => e.id !== id);
    return true;
  },
};