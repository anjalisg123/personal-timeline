// import { api } from "../lib/api";

// // Exact shape returned by /api/me (matches your backend)
// export type Me = {
//   id: string;
//   email: string;
//   name: string;
//   picture?: string | null;
//   timezone?: string | null;
//   bio?: string | null;
// };

// export const getMe = () => api<Me>("/api/me");

// // (we'll add updateMe later when you’re ready to persist)




import { api } from "../lib/api";

export type Me = {
  id: number;          // numeric now
  email: string;
  name: string;
  picture?: string | null;
  timezone?: string | null;
  bio?: string | null;
};

export const getMe = () => api<Me>("/api/me");
// (add updateMe later when needed)
