
import React, { useEffect, useState } from 'react';
import { useApiSync } from '../../hooks/useApiSync';
import type { ApiConnection } from '../../types/ApiConnection';

const ApiConnections: React.FC = () => {
  const { listConnections, connect, disconnect, triggerSync } = useApiSync();
  const [items, setItems] = useState<ApiConnection[]>([]);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  const refresh = async () => setItems(await listConnections());

  useEffect(() => { refresh(); }, []);


  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';

    const normalized = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    return new Date(normalized).toLocaleString();
  };


  const handleSync = async (provider: string) => {
    setSyncing(prev => ({ ...prev, [provider]: true }));
    try {
      await triggerSync(provider as any);
      await refresh(); 
    } finally {
      setSyncing(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">API Connections</h2>
      <div className="grid gap-3">
        {items.map((c) => (
          <div key={c.provider} className="p-4 border rounded-xl bg-white flex items-center justify-between">
            <div>
              <div className="font-medium capitalize">{c.provider}</div>
              <div className="text-sm text-gray-500">{c.isActive ? 'Connected' : 'Not connected'}</div>
              
              {/* Use the helper here */}
              {c.lastSyncAt && (
                <div className="text-xs text-gray-400">
                  Last sync: {formatDate(c.lastSyncAt)}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {c.isActive ? (
                <>
                  <button 
                    className="px-3 py-1 rounded border hover:bg-gray-50" 
                    onClick={async () => { await disconnect(c.provider); refresh(); }}
                  >
                    Disconnect
                  </button>
                  <button 
                    className="px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50" 
                    onClick={() => handleSync(c.provider)}
                    disabled={syncing[c.provider]}
                  >
                    {syncing[c.provider] ? 'Syncing...' : 'Sync now'}
                  </button>
                </>
              ) : (
                <button 
                  className="px-3 py-1 rounded bg-black text-white hover:opacity-90" 
                  onClick={async () => { await connect(c.provider); refresh(); }}
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiConnections;