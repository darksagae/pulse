import React from 'react';
import { useNavigate } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import officialImg from '../assets/images/official.png';
import './PageStyles.css';

const DepartmentSelection: React.FC = () => {
  const navigate = useNavigate();

  const departments = [
    { id: 'nira', name: 'NIRA (National ID)', description: 'National identification documents and citizen registration services' },
    { id: 'ursb', name: 'URSB (Vehicle Registration)', description: 'Vehicle registration, driving licenses, and transport documentation' },
    { id: 'immigration', name: 'Immigration (Passports & Visas)', description: 'Passport issuance, visa processing, and immigration services' },
    { id: 'finance', name: 'Finance (Government Revenue)', description: 'Revenue documents, tax records, and financial documentation' },
    { id: 'health', name: 'Health', description: 'Medical records, health certificates, and public health registrations' }
  ];

  const handleDepartmentSelect = (departmentId: string) => {
    navigate(`/official/${departmentId}`);
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header">
          <img src={officialImg} alt="Official" className="page-icon" />
          <h1 className="page-title">Select Department</h1>
          <p className="page-subtitle">Choose your department to access the official portal</p>
        </div>

        <div className="departments-grid">
          {departments.map((dept) => (
            <div 
              key={dept.id} 
              className="department-card"
              onClick={() => handleDepartmentSelect(dept.id)}
            >
              <h3 className="department-name">{dept.name}</h3>
              <p className="department-description">{dept.description}</p>
              <button className="department-btn">Enter Portal</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
