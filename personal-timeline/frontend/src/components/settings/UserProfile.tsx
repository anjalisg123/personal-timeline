import React from 'react';
import { useAuth } from '../../context/AuthContext';


const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Settings</h2>
      <div className="p-4 border rounded-xl bg-white flex items-center gap-4">
        {user.profileImageUrl && <img src={user.profileImageUrl} alt="" className="w-16 h-16 rounded-full" />}
        <div>
          <div className="font-medium">{user.displayName}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <div className="text-xs text-gray-400">Timezone: {user.timezone ?? '—'}</div>
        </div>
        <div className="ml-auto">
          <button className="px-3 py-1 rounded border" onClick={logout}>Log out</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;