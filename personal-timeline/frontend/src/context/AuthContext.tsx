
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/me";

export type CtxUser = {
  id: number;                 
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
