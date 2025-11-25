import { api } from "../lib/api";
import type { ApiConnection } from "../types/ApiConnection";

type ApiConnRow = {
  id: number;
  provider: string;
  isActive: boolean;
  lastSyncAt?: string | null;
  settings?: string | null;
};

export const apiConnections = {
  async list(): Promise<ApiConnection[]> {
    const rows = await api<ApiConnRow[]>("/api/connections");
    return rows.map(r => ({
      id: r.id,
      provider: r.provider as ApiConnection['provider'],
      isActive: r.isActive,
      lastSyncAt: r.lastSyncAt ?? null,
      settings: r.settings ?? null,
    }));
  },


  async connect(provider: ApiConnection['provider'], tokens?: { accessToken?: string; refreshToken?: string; tokenExpiresAt?: string; settings?: string }) {
    await api(`/api/connections`, {
      method: "POST",
      body: JSON.stringify({
        provider,
        accessToken: tokens?.accessToken ?? null,
        refreshToken: tokens?.refreshToken ?? null,
        tokenExpiresAt: tokens?.tokenExpiresAt ?? null,
        settings: tokens?.settings ?? null,
      })
    });
    return true;
  },

  async disconnect(provider: ApiConnection['provider']) {
    await api<void>(`/api/connections/${provider}`, { method: "DELETE" });
    return true;
  },

  async sync(provider: ApiConnection['provider']) {
    const res = await api<{ ok: boolean; provider: string; lastSyncAt: string }>(`/api/sync/${provider}`, { method: "POST" });
    return res;
  }
};
