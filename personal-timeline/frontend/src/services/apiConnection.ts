// import type { ApiConnection } from '../types/ApiConnection';

// let connections: ApiConnection[] = [
//   { provider: 'github', isActive: true, lastSyncAt: '2025-10-28T22:16:00Z' },
//   { provider: 'strava', isActive: false },
//   { provider: 'spotify', isActive: false },
// ];

// export const apiService = {
//   async listConnections() {
//     return connections;
//   },
//   async connect(provider: ApiConnection['provider']) {
//     const idx = connections.findIndex((c) => c.provider === provider);
//     if (idx === -1) connections.push({ provider, isActive: true, lastSyncAt: new Date().toISOString() });
//     else connections[idx] = { ...connections[idx], isActive: true, lastSyncAt: new Date().toISOString() };
//     return true;
//   },
//   async disconnect(provider: ApiConnection['provider']) {
//     const idx = connections.findIndex((c) => c.provider === provider);
//     if (idx !== -1) connections[idx] = { ...connections[idx], isActive: false };
//     return true;
//   },
//   async triggerSync(provider: ApiConnection['provider']) {
//     const idx = connections.findIndex((c) => c.provider === provider);
//     if (idx !== -1) connections[idx] = { ...connections[idx], lastSyncAt: new Date().toISOString() };
//     // could add new mock entries here
//     return { synced: true };
//   },
// };



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

  // For now we accept tokens via prompt (dev flow). In real OAuth, backend will handle redirect.
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
