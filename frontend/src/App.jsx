import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage.jsx';
import RoleSelectionPage from './pages/auth/RoleSelectionPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminSetupPage from './pages/admin/AdminSetupPage.jsx';
import VendorMenuPage from './pages/student/VendorMenuPage.jsx';
import CheckoutPage from './pages/student/CheckoutPage.jsx';
import OrderConfirmedPage from './pages/student/OrderConfirmedPage.jsx';
import StudentHistoryPage from './pages/student/StudentHistoryPage.jsx';
import AuthCallback from './components/auth/AuthCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        {/* Auth0 handles the callback after Google login */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* After successful login + role selection */}
        <Route path="/role-selection" element={<RoleSelectionPage />} />

        {/* Main dashboards */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Hidden Admin Setup Route */}
        <Route path="/admin/setup" element={<AdminSetupPage />} />

        {/* Student ordering flow */}
        <Route path="/vendor-menu" element={<VendorMenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
        <Route path="/student-history" element={<StudentHistoryPage />} />

        {/* Fallback - redirect unknown routes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


export default App;