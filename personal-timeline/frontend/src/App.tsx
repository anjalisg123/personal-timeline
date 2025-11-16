// import React from 'react';
// import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { TimelineProvider } from './context/TimelineContext';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import Header from './components/layout/Header';
// import Navigation from './components/layout/Navigation';
// import Footer from './components/layout/Footer';
// import TimelineView from './components/timeline/TimelineView';
// import OAuthCallback from './components/auth/OAuthCallback';
// import Settings from './pages/Settings';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import Profile from './pages/Profile';

// const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <div className="min-h-screen bg-gray-50 text-gray-900">
//     <Header />
//     <Navigation />
//     <main>{children}</main>
//     <Footer />
//   </div>
// );

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <TimelineProvider>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/auth/callback" element={<OAuthCallback />} />

//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Shell>
//                     <Dashboard />
//                   </Shell>
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/timeline"
//               element={
//                 <ProtectedRoute>
//                   <Shell>
//                     <TimelineView />
//                   </Shell>
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/settings"
//               element={
//                 <ProtectedRoute>
//                   <Shell>
//                     <Settings />
//                   </Shell>
//                 </ProtectedRoute>
//               }
//             />

            
//             // in App.tsx (or your router)
//             <Route 
//               path="/profile" 
//               element={
//               <ProtectedRoute>
//                 <Shell>
//                   <Profile />
//                 </Shell>
//               </ProtectedRoute>
//               } 
//             />

//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//             <Route path="*" element={<div className="p-6">Not Found</div>} />
//           </Routes>
//         </TimelineProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// };

// export default App;









// src/App.tsx
// import React from 'react';
// import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// import { TimelineProvider } from './context/TimelineContext';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import Header from './components/layout/Header';
// import Navigation from './components/layout/Navigation';
// import Footer from './components/layout/Footer';
// import TimelineView from './components/timeline/TimelineView';
// import OAuthCallback from './components/auth/OAuthCallback';
// import Dashboard from './pages/Dashboard';
// import Profile from './pages/Profile';
// import Settings from './pages/Settings';
// import { AuthProvider } from './context/AuthContext';
// import LoginPage from './pages/Login';

// const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <div className="min-h-screen bg-gray-50 text-gray-900">
//     <Header />
//     <Navigation />
//     <main>{children}</main>
//     <Footer />
//   </div>
// );

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <TimelineProvider>
//           <Routes>
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/auth/callback" element={<OAuthCallback />} />

//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Shell><Dashboard /></Shell>
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/timeline"
//               element={
//                 <ProtectedRoute>
//                   <Shell><TimelineView /></Shell>
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/settings"
//               element={
//                 <ProtectedRoute>
//                   <Shell><Settings /></Shell>
//                 </ProtectedRoute>
//               }
//             />

//             {/* ✅ JSX comments need braces */}
//             {/* Profile page */}
//             <Route
//               path="/profile"
//               element={
//                 <ProtectedRoute>
//                   <Shell><Profile /></Shell>
//                 </ProtectedRoute>
//               }
//             />

//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//             <Route path="*" element={<div className="p-6">Not Found</div>} />
//           </Routes>
//         </TimelineProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// };

// export default App;








// App.tsx
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
