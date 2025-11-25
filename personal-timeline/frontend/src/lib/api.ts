export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = localStorage.getItem("pt_jwt");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  if (res.status === 204) return undefined as T; 
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
