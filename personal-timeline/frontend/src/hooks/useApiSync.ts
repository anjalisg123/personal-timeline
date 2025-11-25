import { api } from "../lib/api";
import type { ApiConnection } from "../types/ApiConnection";



const ALL: ApiConnection["provider"][] = ["github", "strava", "spotify", "todoist"];

type Row = {
  provider: string;
  isActive: boolean;
  lastSyncAt?: string | null;
  settings?: string | Record<string, any> | null;
};

export function useApiSync() {
  const listConnections = async (): Promise<ApiConnection[]> => {
    const rows = await api<Row[]>("/api/connections").catch(() => []);
    const map = new Map(rows.map(r => [r.provider, r]));
    return ALL.map(p => {
      const r = map.get(p);
      return {
        provider: p,
        isActive: r?.isActive ?? false,
        lastSyncAt: (r?.lastSyncAt ?? undefined) as string | undefined,
        settings: typeof r?.settings === "string" ? JSON.parse(r!.settings as string) : (r?.settings as any),
      };
    });
  };


  const connect = async (provider: "github" | "strava" | "spotify" | "todoist") => {
    if (provider === "strava") {

      const { url } = await api<{ url: string }>("/api/oauth/strava/connect-url", { method: "POST" });
      window.location.href = url; 
      return;
    }
    if (provider === "spotify") {
      const { url } = await api<{ url: string }>("/api/oauth/spotify/connect-url", { method: "POST" });
      window.location.href = url;
      return;
    }
    if (provider === "github") {
      const { url } = await api<{ url: string }>("/api/oauth/github/connect-url", { method: "POST" });
      window.location.href = url;
      return;
    }
    await api(`/api/connections/${provider}/connect`, { method: "POST" });
  };
  

  const disconnect = async (provider: ApiConnection["provider"]) => {
    await api(`/api/connections/${provider}/disconnect`, { method: "POST" });
  };

  const triggerSync = async (provider: ApiConnection["provider"]) => {
    await api(`/api/connections/${provider}/sync`, { method: "POST" });
  };

  return { listConnections, connect, disconnect, triggerSync };
}

