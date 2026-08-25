import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/Home/HomePage';
import LocationPage from './pages/Location/LocationPage';
import LocationDetailsPage from './pages/LocationDetails/LocationDetailsPage';

// Admin / auth pages
import LoginPage from './pages/Admin/LoginPage';
import RegisterPage from './pages/Admin/RegisterPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ListingForm from './pages/Admin/ListingForm';
import ReservationsPage from './pages/Admin/ReservationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public routes (with header) ──────────────────────────── */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/locations"
            element={
              <Layout>
                <LocationPage />
              </Layout>
            }
          />
          <Route
            path="/locations/:id"
            element={
              <Layout>
                <LocationDetailsPage />
              </Layout>
            }
          />

          {/* ── Auth routes (no header) ───────────────────────────────── */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterPage />} />

          {/* ── Protected admin routes ────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create"
            element={
              <ProtectedRoute requireAdmin>
                <ListingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <ListingForm />
              </ProtectedRoute>
            }
          />

          {/* ── Protected reservations (any logged-in user) ───────────── */}
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all redirect ────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
