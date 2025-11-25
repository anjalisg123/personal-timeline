import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TimelineView from "./components/timeline/TimelineView";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import { TimelineProvider } from "./context/TimelineContext";

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    <Header />
    <Navigation />
    <main>{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimelineProvider>
          <Routes>
            {/* 🚪 Default to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Shell><Dashboard /></Shell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/timeline"
              element={
                <ProtectedRoute>
                  <Shell><TimelineView /></Shell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Shell><Settings /></Shell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Shell><Profile /></Shell>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<div className="p-6">Not Found</div>} />
          </Routes>
        </TimelineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
