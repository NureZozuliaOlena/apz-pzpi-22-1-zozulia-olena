import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DownloadPage from './pages/DownloadPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/download" />} />
        <Route path="/download" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
};

export default App;
