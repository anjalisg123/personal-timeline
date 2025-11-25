import { api } from "../lib/api";

export type Me = {
  id: number;          
  email: string;
  name: string;
  picture?: string | null;
  timezone?: string | null;
  bio?: string | null;
};

export const getMe = () => api<Me>("/api/me");

