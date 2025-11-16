import React, { useEffect, useState } from 'react';
import { useApiSync } from '../../hooks/useApiSync';
import type { ApiConnection } from '../../types/ApiConnection';

const ApiConnections: React.FC = () => {
  const { listConnections, connect, disconnect, triggerSync } = useApiSync();
  const [items, setItems] = useState<ApiConnection[]>([]);

  const refresh = async () => setItems(await listConnections());

  useEffect(() => { refresh(); }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">API Connections</h2>
      <div className="grid gap-3">
        {items.map((c) => (
          <div key={c.provider} className="p-4 border rounded-xl bg-white flex items-center justify-between">
            <div>
              <div className="font-medium capitalize">{c.provider}</div>
              <div className="text-sm text-gray-500">{c.isActive ? 'Connected' : 'Not connected'}</div>
              {c.lastSyncAt && <div className="text-xs text-gray-400">Last sync: {new Date(c.lastSyncAt).toLocaleString()}</div>}
            </div>
            <div className="flex gap-2">
              {c.isActive ? (
                <button className="px-3 py-1 rounded border" onClick={async () => { await disconnect(c.provider); refresh(); }}>
                  Disconnect
                </button>
              ) : (
                <button className="px-3 py-1 rounded bg-black text-white" onClick={async () => { await connect(c.provider); refresh(); }}>
                  Connect
                </button>
              )}
              <button className="px-3 py-1 rounded border" onClick={async () => { await triggerSync(c.provider); refresh(); }}>
                Sync now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiConnections;