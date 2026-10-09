import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { IntroAnimation } from './components/IntroAnimation';
import { VoiceAssistantButton } from './components/VoiceAssistant/VoiceAssistantButton';
import { VoiceAssistantPanel } from './components/VoiceAssistant/VoiceAssistantPanel';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderListingPage } from './pages/ProviderListingPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { NewServiceRequestPage } from './pages/NewServiceRequestPage';
import { QuotationsComparisonPage } from './pages/QuotationsComparisonPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderProfileManagePage } from './pages/ProviderProfileManagePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Protected Route Helpers
const ProtectedCustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedProviderRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  if (!user || user.role !== 'provider') return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <VoiceAssistantProvider>
          {/* Opening animation: shows once per browser session */}
          <IntroAnimation onComplete={() => setIntroComplete(true)} />

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/providers" element={<ProviderListingPage />} />
                <Route path="/providers/:id" element={<ProviderProfilePage />} />

                {/* Customer Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerDashboard />
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/requests/new"
                  element={
                    <ProtectedCustomerRoute>
                      <NewServiceRequestPage />
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/requests/:id/quotations"
                  element={
                    <ProtectedCustomerRoute>
                      <QuotationsComparisonPage />
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/bookings/:id"
                  element={
                    <ProtectedCustomerRoute>
                      <BookingDetailsPage />
                    </ProtectedCustomerRoute>
                  }
                />

                {/* Provider Routes */}
                <Route
                  path="/provider/dashboard"
                  element={
                    <ProtectedProviderRoute>
                      <ProviderDashboard />
                    </ProtectedProviderRoute>
                  }
                />
                <Route
                  path="/provider/profile-manage"
                  element={
                    <ProtectedProviderRoute>
                      <ProviderProfileManagePage />
                    </ProtectedProviderRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboardPage />
                    </ProtectedAdminRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />

            {/* Voice Assistant Components */}
            <VoiceAssistantButton />
            <VoiceAssistantPanel />
          </div>
        </VoiceAssistantProvider>
      </AuthProvider>
    </Router>
  );
}

