import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import ugFlag from './assets/images/ug.png';
import citizenImg from './assets/images/citizen.png';
import officialImg from './assets/images/official.png';
import adminImg from './assets/images/admin.png';
import CitizenPage from './components/CitizenPage';
import OfficialPage from './components/OfficialPage';
import AdminPage from './components/AdminPage';
import DepartmentPortal from './components/DepartmentPortal';
import DatabaseTest from './test-database';
import SimpleTest from './simple-test';
import TestSupabase from './test-supabase';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCitizenClick = () => {
    navigate('/citizen');
  };

  const handleOfficialClick = () => {
    navigate('/official');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="App" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="container">
        <div className="logo-section">
          <h1 className="logo">PublicPulse</h1>
          <p className="tagline">Document Processing Automation System</p>
        </div>
        
        <div className="welcome-section">
          <p className="welcome-subtitle">
            Select your access level to continue
          </p>
        </div>

        <div className="access-options">
          <div className="access-card citizen">
            <img src={citizenImg} alt="Citizen" className="access-image" />
            <p>Access public services and submit documents</p>
            <button className="access-btn" onClick={handleCitizenClick}>Enter as Citizen</button>
          </div>

          <div className="access-card official">
            <img src={officialImg} alt="Official" className="access-image" />
            <p>Process and manage citizen documents</p>
            <button className="access-btn" onClick={handleOfficialClick}>Enter as Official</button>
          </div>

          <div className="access-card admin">
            <img src={adminImg} alt="Admin" className="access-image" />
            <p>System administration and configuration</p>
            <button className="access-btn" onClick={handleAdminClick}>Enter as Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/citizen" element={<CitizenPage />} />
      <Route path="/official" element={<OfficialPage />} />
      <Route path="/official/:departmentId" element={<DepartmentPortal />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/test-db" element={<DatabaseTest />} />
      <Route path="/simple" element={<SimpleTest />} />
      <Route path="/test-supabase" element={<TestSupabase />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;