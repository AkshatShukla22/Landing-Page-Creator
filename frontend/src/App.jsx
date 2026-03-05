// frontend/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './store/authSlice';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import AdminPage from './pages/AdminPage';
import LandingPageView from './pages/LandingPageView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) dispatch(loadUser());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/p/:slug" element={<LandingPageView />} />

        {/* Auth — redirect to /home if already logged in */}
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />}
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/auth" replace />}
        />

        {/* Protected */}
        <Route path="/home"      element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create"    element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
        <Route path="/edit/:id"  element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;