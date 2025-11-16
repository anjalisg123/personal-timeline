// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import { useLocalStorage } from '../hooks/useLocalStorage';
// import { authService } from '../services/authService';
// import type { User } from '../types/User';

// type AuthState = {
//   user: User | null;
//   token: string | null;
//   login: (provider: 'google' | 'github') => Promise<void>;
//   logout: () => Promise<void>;
//   loading: boolean;
// };

// const AuthContext = createContext<AuthState | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useLocalStorage<string | null>('auth.token', null);
//   const [user, setUser] = useLocalStorage<User | null>('auth.user', null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       const me = await authService.me(token || undefined);
//       setUser(me);
//       setLoading(false);
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const login = async (provider: 'google' | 'github') => {
//     setLoading(true);
//     const { user, token } = await authService.loginWithProvider(provider);
//     setUser(user);
//     setToken(token);
//     setLoading(false);
//   };

//   const logout = async () => {
//     await authService.logout();
//     setUser(null);
//     setToken(null);
//   };

//   const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuthContext = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
//   return ctx;
// };

// src/auth/AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";

// type User = { id: string; email?: string; name?: string; picture?: string; timezone?: string; bio?: string  };
// type AuthState = { token: string | null; user: User | null; loading: boolean };
// type Ctx = AuthState & {
//   user: User | null;
//   token: string | null;
//   loading: boolean;
//   acceptJwt: (token: string, user: User) => void;
//   logout: () => void;
//   updateUser: (patch: Partial<User>) => void;   // ← add this
// };

// const AuthCtx = createContext<Ctx | null>(null);

// // ✅ use the same keys your login writes
// const JWT_KEY = "pt_jwt";
// const USER_KEY = "pt_user";

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser]   = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const t = localStorage.getItem(JWT_KEY);
//     const u = localStorage.getItem(USER_KEY);
//     if (t) setToken(t);
//     if (u) setUser(JSON.parse(u));
//     setLoading(false);
//   }, []);

//   const acceptJwt = (jwt: string, usr: User) => {
//     setToken(jwt);
//     setUser(usr);
//     localStorage.setItem(JWT_KEY, jwt);
//     localStorage.setItem(USER_KEY, JSON.stringify(usr));
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem(JWT_KEY);
//     localStorage.removeItem(USER_KEY);
//   };
//   const updateUser = (patch: Partial<User>) => {
//     setUser(prev => {
//       const next = { ...(prev ?? {}), ...patch } as User;
//       localStorage.setItem("pt_user", JSON.stringify(next));   // use your unified key
//       return next;
//     });
//   };

//   return (
//     <AuthCtx.Provider value={{ token, user, loading, acceptJwt, logout }}>
//       {children}
//     </AuthCtx.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthCtx);
//   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
//   return ctx;
// };










import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/me";

export type CtxUser = {
  id: number;                 // numeric now
  email?: string;
  displayName?: string;
  profileImageUrl?: string | null;
  picture?: string | null;
  timezone?: string;
  bio?: string;
};

type AuthState = {
  token: string | null;
  user: CtxUser | null;
  loading: boolean;
};

type AuthCtx = AuthState & {
  acceptJwt: (token: string, user: CtxUser) => void;
  logout: () => void;
  updateUser: (patch: Partial<CtxUser>) => void;
  refreshMe: () => Promise<void>;
};

const AuthCtx = createContext<AuthCtx | null>(null);

const JWT_KEY = "pt_jwt";
const USER_KEY = "pt_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser]   = useState<CtxUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapBackendUser = (me: any): CtxUser => ({
    id: me.id as number,
    email: me.email,
    displayName: me.displayName ?? me.name ?? "",
    profileImageUrl: me.profileImageUrl ?? null,
    picture: me.profileImageUrl ?? me.picture ?? null,
    timezone: me.timezone ?? "America/Chicago",
    bio: me.bio ?? "",
  });

  const refreshMe = async () => {
    const t = localStorage.getItem(JWT_KEY);
    if (!t) return;
    try {
      const me = await getMe();
      const mapped = mapBackendUser(me);
      setUser(mapped);
      localStorage.setItem(USER_KEY, JSON.stringify(mapped));
    } catch {
      localStorage.removeItem(JWT_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem(JWT_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setToken(t);
    if (u) {
      try { setUser(JSON.parse(u)); } catch {}
    }
    (async () => {
      if (t) await refreshMe();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acceptJwt = (jwt: string, usr: CtxUser) => {
    setToken(jwt);
    setUser(usr);
    localStorage.setItem(JWT_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(usr));
  };

  const updateUser = (patch: Partial<CtxUser>) => {
    setUser(prev => {
      const next = { ...(prev ?? {}), ...patch } as CtxUser;
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthCtx.Provider value={{ token, user, loading, acceptJwt, logout, updateUser, refreshMe }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
