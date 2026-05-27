import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Lazy-loaded pages — each becomes its own JS chunk loaded on demand
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PropertiesPage = lazy(() => import('@/pages/properties/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const AddPropertyPage = lazy(() => import('@/pages/properties/AddPropertyPage').then(m => ({ default: m.AddPropertyPage })));
const BookingsPage = lazy(() => import('@/pages/bookings/BookingsPage').then(m => ({ default: m.BookingsPage })));
const AddBookingPage = lazy(() => import('@/pages/bookings/AddBookingPage').then(m => ({ default: m.AddBookingPage })));
const EditBookingPage = lazy(() => import('@/pages/bookings/EditBookingPage').then(m => ({ default: m.EditBookingPage })));
const CalendarPage = lazy(() => import('@/pages/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const RevenuePage = lazy(() => import('@/pages/revenue/RevenuePage').then(m => ({ default: m.RevenuePage })));
const ExpensesPage = lazy(() => import('@/pages/expenses/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PricingPage = lazy(() => import('@/pages/pricing/PricingPage').then(m => ({ default: m.PricingPage })));
const GuestGuidePage = lazy(() => import('@/pages/guide/GuestGuidePage').then(m => ({ default: m.GuestGuidePage })));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/guide/:token" element={<GuestGuidePage />} />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/add" element={<AddPropertyPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/add" element={<AddBookingPage />} />
          <Route path="bookings/:bookingId/edit" element={<EditBookingPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
