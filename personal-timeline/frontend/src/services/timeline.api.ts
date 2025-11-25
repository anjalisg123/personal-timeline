import { api } from "../lib/api";
import type { TimelineEntry } from "../types/TimelineEntry";


const normEntryType = (s?: string | null) => {
  if (!s) return "Note";
  const t = s.trim().toLowerCase();
  if (t === "note") return "Note";
  if (t === "milestone") return "Milestone";
  if (t === "achievement") return "Achievement";

  if (t === "memory" || t === "activity") return "Note";
  return "Note";
};

const normSource = (s?: string | null) => (s && s.trim()) ? s.trim() : "manual";

type ApiEntry = {
  id: number;                 
  title: string;
  description?: string | null;
  entryType?: string | null;  
  category?: string | null;
  sourceApi?: string | null;
  eventDate: string;         
  createdAt?: string | null;
  externalUrl?: string | null;
  fileAttachment?: string | null;  
  fileName?: string | null;         
  fileType?: string | null;        
};

type ApiList = { items: ApiEntry[] };

function fromApi(e: ApiEntry): TimelineEntry {
  return {
    id: e.id,                                    
    title: e.title,
    description: e.description ?? undefined,
    eventDate: e.eventDate,
    entryType: normEntryType(e.entryType ?? undefined),
    category: e.category ?? undefined,
    imageUrl: undefined,        
    fileAttachment: e.fileAttachment ?? undefined,  
    fileName: e.fileName ?? undefined,              
    fileType: e.fileType ?? undefined,                           
    sourceApi: normSource(e.sourceApi ?? undefined),
    externalId: undefined,
    metadata: undefined,
    createdAt: e.createdAt ?? undefined,
    updatedAt: undefined,
    externalUrl: e.externalUrl ?? undefined,
  };
}

function toApiCreate(e: Omit<TimelineEntry, "id" | "createdAt" | "updatedAt">) {
  return {
    title: e.title,
    description: e.description ?? null,
    entryType: normEntryType(e.entryType as any),
    category: e.category ?? null,
    sourceApi: normSource(e.sourceApi as any),
    eventDate: e.eventDate,
    externalUrl: e.externalUrl ?? null,
    fileAttachment: e.fileAttachment ?? null,  
    fileName: e.fileName ?? null,              
    fileType: e.fileType ?? null,              

  };
}

function toApiUpdate(patch: Partial<TimelineEntry>) {
  return {
    title: patch.title,
    description: patch.description,
    entryType: patch.entryType ? normEntryType(patch.entryType as any) : undefined,
    category: patch.category,
    sourceApi: patch.sourceApi ? normSource(patch.sourceApi as any) : undefined,
    eventDate: patch.eventDate,
    externalUrl: patch.externalUrl,
    fileAttachment: patch.fileAttachment,  
    fileName: patch.fileName,             
    fileType: patch.fileType,              
  };
}

export const timelineApiService = {
  async list(params?: {
    search?: string; type?: string; source?: string;
    from?: string; to?: string; page?: number; pageSize?: number;
  }): Promise<{ items: TimelineEntry[]; total: number }> {
    const res = await api<ApiList>("/api/entries");
    let items = res.items.map(fromApi);

    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(e => (`${e.title} ${e.description ?? ""}`).toLowerCase().includes(q));
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

  async get(id: string | number) {

    const res = await api<ApiList>("/api/entries");
    const numId = typeof id === "string" ? Number(id) : id;
    const found = res.items.find(e => e.id === numId);
    return found ? fromApi(found) : null;
  },

  async create(entry: Omit<TimelineEntry, "id" | "createdAt" | "updatedAt">) {
    const saved = await api<ApiEntry>("/api/entries", {
      method: "POST",
      body: JSON.stringify(toApiCreate(entry)),
    });
    return fromApi(saved);
  },

  async update(id: string | number, patch: Partial<TimelineEntry>) {
    const saved = await api<ApiEntry>(`/api/entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(toApiUpdate(patch)),
    });
    return fromApi(saved);
  },

  async remove(id: string | number) {
    await api<void>(`/api/entries/${id}`, { method: "DELETE" });
    return true;
  },
};
