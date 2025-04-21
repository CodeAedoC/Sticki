import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, Outlet, useParams } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import About from './pages/About'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import RoomEntryPage from './pages/RoomEntryPage'
import { useAuth } from './contexts/AuthContext'
import { RoomProvider } from './liveblocks.config'
import { LiveList, LiveMap } from "@liveblocks/client"
import './App.css';

// Layout for protected routes needing Room Context
function RoomLayout() {
  const { roomId } = useParams(); // Get roomId from URL

  if (!roomId) {
    // Handle cases where roomId might be missing unexpectedly
    console.error("Room ID is missing!");
    return <Navigate to="/select-room" replace />;
  }

  // Wrap the Outlet (which will render Home) with RoomProvider using the dynamic ID
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null, color: "#000000", isDrawing: false }}
      initialStorage={{
        paths: new LiveList([]),
        notes: new LiveMap()
      }}
    >
      <Outlet /> {/* Renders the matched child route (Home) */}
    </RoomProvider>
  );
}

// Helper component for routes accessible only when logged out
function PublicRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading-fullscreen">Loading...</div>;
  if (session) return <Navigate to="/select-room" replace />;
  return children;
}

// Updated ProtectedRoute to use RoomLayout when needed
function ProtectedRoute({ children, requiresRoom = false }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading-fullscreen">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;

  // No need to wrap non-room routes like About or RoomEntryPage in RoomProvider
  // RoomLayout will wrap the Outlet for routes under /app/:roomId
  return children;
}

function App() {
  const { session, loading, signOut, user } = useAuth();

  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme, default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Apply class to body and save theme to localStorage
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // No need for app-wide loading check here, handled by ProtectedRoute or individual pages
  // if (loading) {
  //   return <div className="loading-fullscreen">Loading...</div>;
  // }

  return (
    <div className="app-container">
      {/* Conditionally render Nav based on route or session? For now, render if session exists */}
      {session && (
        <nav className="app-nav">
          <ul>
            {/* Link to Room Selection */}
            <li><Link to="/select-room">Rooms</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
          <button
            onClick={toggleTheme}
            className="btn theme-toggle-btn"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={signOut} className="btn logout-btn">
            Logout ({user?.email})
          </button>
        </nav>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/select-room" element={<ProtectedRoute><RoomEntryPage /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />

        {/* Nested route for the actual whiteboard app, wrapped by RoomLayout */}
        <Route path="/app/:roomId" element={<ProtectedRoute><RoomLayout /></ProtectedRoute>}>
          {/* Home component is rendered inside RoomLayout's Outlet */}
          <Route index element={<Home />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={session ? "/select-room" : "/"} replace />} />
      </Routes>
    </div>
  )
}

export default App
