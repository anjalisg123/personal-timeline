import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback: React.FC = () => {
  const nav = useNavigate();
  useEffect(() => {
    nav('/dashboard');
  }, [nav]);
  return <div className="p-6">Finishing sign-in…</div>;
};

export default OAuthCallback;
