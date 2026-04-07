import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage.jsx';
import RoleSelectionPage from './pages/auth/RoleSelectionPage.jsx';
//import StudentDashboard from './pages/student/StudentDashboard.jsx';
//import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
//import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        {/* <Route path="/student-dashboard" element={<StudentDashboard />} /> */}
        {/* <Route path="/vendor-dashboard" element={<VendorDashboard />} /> */}
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
     </Routes>
    </Router>
  );
}

export default App;