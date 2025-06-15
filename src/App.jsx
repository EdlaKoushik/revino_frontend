import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  useAuth,
} from '@clerk/clerk-react';

import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Upgrade from './Pages/Upgrade';
import Settings from './Pages/Settings';
import InterviewCreationPage from './Pages/InterviewCreationPage';
import InterviewSessionPage from './Pages/InterviewSessionPage';
import FeedbackPage from './Pages/FeedbackPage';
import ScheduleMockPage from './Pages/ScheduleMockPage';
import AdminPanel from './Pages/AdminPanel';

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded) return;

    const currentPath = location.pathname;

    const publicPaths = ['/'];
    const isOnPublicPage = publicPaths.includes(currentPath);

    const protectedPaths = [
      '/dashboard', '/upgrade', '/settings', '/create-interview',
      '/interview-creation', '/interview-session', '/feedback',
      '/schedule-mock', '/admin'
    ];
    const isTryingToAccessProtected =
      protectedPaths.some(path => currentPath.startsWith(path));

    if (isSignedIn && isOnPublicPage) {
      navigate('/dashboard');
    }

    if (!isSignedIn && isTryingToAccessProtected) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<SignedIn><Dashboard /></SignedIn>} />
      <Route path="/upgrade" element={<SignedIn><Upgrade /></SignedIn>} />
      <Route path="/settings" element={<SignedIn><Settings /></SignedIn>} />
      <Route path="/create-interview" element={<SignedIn><InterviewCreationPage /></SignedIn>} />
      <Route path="/interview-session/:id" element={<SignedIn><InterviewSessionPage /></SignedIn>} />
      <Route path="/feedback/:id" element={<SignedIn><FeedbackPage /></SignedIn>} />
      <Route path="/feedback" element={<SignedIn><FeedbackPage /></SignedIn>} />
      <Route path="/schedule-mock" element={<SignedIn><ScheduleMockPage /></SignedIn>} />
      <Route path="/admin" element={<SignedIn><AdminPanel /></SignedIn>} />
      <Route path="/interview-creation" element={<SignedIn><InterviewCreationPage /></SignedIn>} />
    </Routes>
  );
}
