import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type Props = {
  onSuccess: (jwt: string, user: { id: string; email: string; name: string; picture?: string }) => void;
  onError?: (msg: string) => void;
};

const GoogleLoginButton: React.FC<Props> = ({ onSuccess, onError }) => {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // put your client id in .env

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        try {
          const idToken = resp.credential; // Google ID token
          const res = await fetch("http://localhost:5001/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken })
          });
          if (!res.ok) throw new Error("Auth failed");
          const data = await res.json(); // { token, user }
          onSuccess(data.token, data.user);
        } catch (e: any) {
          onError?.(e.message || "Login failed");
        }
      }
    });

    if (btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 240
      });
    }
  }, []);

  return <div ref={btnRef} />;
};

export default GoogleLoginButton;
