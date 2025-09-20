import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import officialIcon from '../assets/images/official.png';
// import { User } from '../lib/api';
import DocumentReviewPage from './DocumentReviewPage';
import DepartmentDocumentReview from './DepartmentDocumentReview';
import './PageStyles.css';
import './OfficialPage.css';
import '../styles/glassmorphism.css';

const OfficialPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDocumentReview, setShowDocumentReview] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{id: string, name: string} | null>(null);

  const departments = [
    {
      id: 'nira',
      name: 'NIRA',
      fullName: 'National Identification and Registration Authority',
      description: 'National ID services and citizen registration',
      color: '#e74c3c'
    },
    {
      id: 'ursb',
      name: 'URSB',
      fullName: 'Uganda Registration Services Bureau',
      description: 'Vehicle registration and driving licenses',
      color: '#f39c12'
    },
    {
      id: 'immigration',
      name: 'Immigration',
      fullName: 'Directorate of Immigration Control',
      description: 'Passport and visa processing services',
      color: '#3498db'
    },
    {
      id: 'finance',
      name: 'Finance',
      fullName: 'Ministry of Finance, Planning and Economic Development',
      description: 'Government revenue and tax services',
      color: '#2ecc71'
    },
    {
      id: 'health',
      name: 'Health',
      fullName: 'Ministry of Health',
      description: 'Health certificates and medical records',
      color: '#9b59b6'
    }
  ];

  const handleDepartmentClick = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (department) {
      setSelectedDepartment(department);
    }
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
    setShowDocumentReview(false);
  };

  if (selectedDepartment) {
    return (
      <DepartmentDocumentReview 
        departmentId={selectedDepartment.id}
        departmentName={selectedDepartment.name}
        onBack={handleBackToDepartments}
      />
    );
  }

  if (showDocumentReview) {
    return (
      <div>
        <button 
          className="action-btn secondary" 
          onClick={handleBackToDepartments}
          style={{ margin: '20px', position: 'absolute', top: 0, left: 0, zIndex: 1000 }}
        >
          ← Back to Departments
        </button>
        <DocumentReviewPage />
      </div>
    );
  }

  // const handleDepartmentSelect = (departmentId: string) => {
  //   navigate(`/department/${departmentId}`);
  // };

  return (
    <div className="glass-official-page" style={{ backgroundImage: `url(${ugFlag})` }}>
      {/* Animated background elements */}
      <div className="glass-bg-elements">
        <div className="glass-bg-circle glass-bg-circle-1"></div>
        <div className="glass-bg-circle glass-bg-circle-2"></div>
        <div className="glass-bg-circle glass-bg-circle-3"></div>
        <div className="glass-bg-circle glass-bg-circle-4"></div>
      </div>

      <div className="glass-official-container">
        {/* Header */}
        <div className="glass-official-header">
          <div className="glass-official-logo">
            <img 
              src={officialIcon}
              alt="Official Portal Logo" 
              className="round-logo"
            />
            <h1 className="glass-official-title">Official Portal</h1>
            <p className="glass-official-subtitle">Select your department to access your workspace</p>
          </div>
        </div>

        {/* Document Review Section */}
        <div className="glass-document-review-section">
          <div className="glass-card">
            <h3>Document Management</h3>
            <p>Review and process citizen-submitted documents</p>
            <button 
              className="action-btn primary"
              onClick={() => setShowDocumentReview(true)}
              style={{ marginTop: '15px' }}
            >
              📄 Review Submitted Documents
            </button>
          </div>
        </div>

        {/* Department Selection */}
        <div className="glass-departments-section">
          <h2 className="glass-section-title">Choose Your Department</h2>
          <div className="glass-departments-grid">
            {departments.map((department) => (
              <div
                key={department.id}
                className="glass-department-card"
                style={{ borderLeftColor: department.color }}
                onClick={() => handleDepartmentClick(department.id)}
              >
                <div className="glass-department-icon" style={{ backgroundColor: department.color }}>
                  <div className="department-initial">{department.name.charAt(0)}</div>
                </div>
                <div className="glass-department-info">
                  <h3 className="glass-department-name">{department.name}</h3>
                  <h4 className="glass-department-full-name">{department.fullName}</h4>
                  <p className="glass-department-description">{department.description}</p>
                </div>
                <div className="glass-department-arrow">
                  <span className="glass-arrow-icon">→</span>
                </div>
                <div className="glass-card-shine"></div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .glass-document-review-section {
            margin: 30px 0;
            text-align: center;
          }

          .glass-document-review-section .glass-card {
            max-width: 500px;
            margin: 0 auto;
            padding: 30px;
          }

          .glass-document-review-section h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.5em;
          }

          .glass-document-review-section p {
            color: #7f8c8d;
            margin-bottom: 20px;
          }

          .action-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
          }

          .action-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }

          .action-btn.secondary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          .action-btn.secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
          }
        `
      }} />
    </div>
  );
};

export default OfficialPage;