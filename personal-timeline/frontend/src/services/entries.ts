import { api } from "../lib/api";

export type Entry = {
  id: string;
  title: string;
  description?: string | null;
  entryType?: string | null;
  category?: string | null;
  sourceApi?: string | null;
  eventDate: string;          // ISO from backend
  createdAt?: string | null;
  externalUrl?: string | null;
};

// Backend returns { items: Entry[] }
export const listEntries = async (): Promise<Entry[]> => {
  const res = await api<{ items: Entry[] }>("/api/entries");
  return res.items;
};
