import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className='p-8 text-center text-2xl'>Welcome to OrderUp - Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App
