import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ugFlag from './assets/images/ug.png';
import citizenIcon from './assets/images/citizen.png';
import officialIcon from './assets/images/official.png';
import adminIcon from './assets/images/admin.png';
import './App.css';
import './styles/glassmorphism.css';
import CitizenPage from './components/CitizenPage';
import OfficialPage from './components/OfficialPage';
import AdminPage from './components/AdminPage';
import DepartmentPortal from './components/DepartmentPortal';
import DocumentReviewPage from './components/DocumentReviewPage';
import ConnectionTest from './ConnectionTest';
import EnvironmentTest from './EnvironmentTest';
import DirectConnectionTest from './DirectConnectionTest';
import { health } from './lib/api';

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
        <div className="logo-section glass-card-lg">
          <h1 className="logo">PublicPulse</h1>
          <p className="tagline">Document Processing Automation System</p>
        </div>
        
        <div className="welcome-section">
          <p className="welcome-subtitle">
            Select your access level to continue
          </p>
        </div>

        <div className="access-options">
          <div className="access-card citizen glass-card">
            <div className="access-content">
              <img 
                src={citizenIcon}
                alt="Citizen Portal" 
                className="citizen-icon-image"
              />
              <h3>Citizen Portal</h3>
              <p>Access public services and submit documents</p>
              <button className="access-btn glass-btn glass-btn-primary" onClick={handleCitizenClick}>Enter as Citizen</button>
            </div>
          </div>

          <div className="access-card official glass-card">
            <div className="access-content">
              <img 
                src={officialIcon}
                alt="Official Portal" 
                className="official-icon-image"
              />
              <h3>Official Portal</h3>
              <p>Process and review citizen documents</p>
              <button className="access-btn glass-btn glass-btn-secondary" onClick={handleOfficialClick}>Enter as Official</button>
            </div>
          </div>

          <div className="access-card admin glass-card">
            <div className="access-content">
              <img 
                src={adminIcon}
                alt="Admin Portal" 
                className="admin-icon-image"
              />
              <h3>Admin Portal</h3>
              <p>Manage system and oversee operations</p>
              <button className="access-btn glass-btn glass-btn-warning" onClick={handleAdminClick}>Enter as Admin</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Direct access to portals - no authentication required */}
          <Route path="/citizen" element={<CitizenPage />} />
          <Route path="/official" element={<OfficialPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/department/:departmentId" element={<DepartmentPortal user={{ id: '1', full_name: 'Official User', email: 'official@example.com', role: 'official' }} />} />
          <Route path="/document/:cardNumber" element={<DocumentReviewPage />} />
          <Route path="/document-review/:cardNumber" element={<DocumentReviewPage />} />
          <Route path="/test" element={<ConnectionTest />} />
          <Route path="/env" element={<EnvironmentTest />} />
          <Route path="/direct" element={<DirectConnectionTest />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;