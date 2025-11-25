import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const nav = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🧭</div>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          We couldn’t find the page you were looking for. It may have been moved or deleted.
        </p>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={() => nav("/dashboard")}
            className="px-4 py-2 rounded-xl bg-black text-white shadow hover:opacity-95"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => nav(-1)}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            Go back
          </button>
        </div>

        <div className="text-xs text-gray-400">
          If you think this is an error, try refreshing or contact support.
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
