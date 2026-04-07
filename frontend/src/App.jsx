import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* This line tells React to show WelcomePage when someone visits the home page */}
        <Route path="/" element={<WelcomePage />} />
      </Routes>
    </Router>
  );
}

export default App;