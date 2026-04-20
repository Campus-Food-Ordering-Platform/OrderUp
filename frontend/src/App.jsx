import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import WelcomePage from './pages/WelcomePage.jsx';
import RoleSelectionPage from './pages/auth/RoleSelectionPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import VendorMenuPage from './pages/student/VendorMenuPage.jsx';
import CheckoutPage from './pages/student/CheckoutPage.jsx';
import OrderConfirmedPage from './pages/student/OrderConfirmedPage.jsx';
import AuthCallback from './components/auth/AuthCallback';

function App() {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F7F5F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#C0474A', fontSize: '1.1rem', fontWeight: 600 }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/auth/callback" /> : <WelcomePage />}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/vendor-menu" element={<VendorMenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}


export default App;