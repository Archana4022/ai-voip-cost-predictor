import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import PredictPage from './pages/PredictPage';
import CallHistoryPage from './pages/CallHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/predict" element={<PredictPage setRefreshTrigger={setRefreshTrigger} />} />
        <Route path="/history" element={<CallHistoryPage refreshTrigger={refreshTrigger} />} />
        <Route path="/analytics" element={<AnalyticsPage refreshTrigger={refreshTrigger} />} />
      </Routes>
    </Router>
  );
}

export default App;
