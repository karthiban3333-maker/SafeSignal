import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import CompanyAuth from './pages/CompanyAuth';
import StaffAuth from './pages/StaffAuth';
import GuestLogin from './pages/GuestLogin';
import Home from './pages/Home';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { currentUser, loading, userData } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sos-blue/30 border-t-sos-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // If staff hasn't selected a company yet, redirect to staff auth which shows search
  if (userData && userData.role === 'staff' && !userData.companyId) {
    return <StaffAuth />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/company-auth" element={<CompanyAuth />} />
          <Route path="/staff-auth" element={<StaffAuth />} />
          <Route path="/guest-login" element={<GuestLogin />} />
          
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#34c759',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff2d55',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
