import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import officialImg from '../assets/images/official.png';
import './PageStyles.css';

const DepartmentPortal: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for document queues
  const mockDocuments = {
    nira: [
      { id: 'NIRA001', type: 'ID Application', citizen: 'John Doe', status: 'Pending Review', priority: 'High', submitted: '2024-01-15' },
      { id: 'NIRA002', type: 'ID Renewal', citizen: 'Jane Smith', status: 'Under Verification', priority: 'Medium', submitted: '2024-01-14' },
      { id: 'NIRA003', type: 'Lost ID Report', citizen: 'Mike Johnson', status: 'Approved', priority: 'High', submitted: '2024-01-13' }
    ],
    ursb: [
      { id: 'URSB001', type: 'Vehicle Registration', citizen: 'Alice Brown', status: 'Payment Pending', priority: 'Medium', submitted: '2024-01-15' },
      { id: 'URSB002', type: 'Driving License', citizen: 'Bob Wilson', status: 'Under Review', priority: 'High', submitted: '2024-01-14' },
      { id: 'URSB003', type: 'Ownership Transfer', citizen: 'Carol Davis', status: 'Completed', priority: 'Low', submitted: '2024-01-12' }
    ],
    immigration: [
      { id: 'IMM001', type: 'Passport Application', citizen: 'David Lee', status: 'Biometrics Pending', priority: 'High', submitted: '2024-01-15' },
      { id: 'IMM002', type: 'Visa Application', citizen: 'Emma Taylor', status: 'Under Review', priority: 'Medium', submitted: '2024-01-14' },
      { id: 'IMM003', type: 'Work Permit', citizen: 'Frank Miller', status: 'Approved', priority: 'High', submitted: '2024-01-13' }
    ],
    finance: [
      { id: 'FIN001', type: 'Tax Return', citizen: 'Grace White', status: 'Under Assessment', priority: 'High', submitted: '2024-01-15' },
      { id: 'FIN002', type: 'VAT Registration', citizen: 'Henry Green', status: 'Document Review', priority: 'Medium', submitted: '2024-01-14' },
      { id: 'FIN003', type: 'Business Permit', citizen: 'Ivy Black', status: 'Completed', priority: 'Low', submitted: '2024-01-12' }
    ],
    health: [
      { id: 'HLT001', type: 'Medical Certificate', citizen: 'Jack Blue', status: 'Medical Review', priority: 'High', submitted: '2024-01-15' },
      { id: 'HLT002', type: 'Health Permit', citizen: 'Kate Red', status: 'Under Review', priority: 'Medium', submitted: '2024-01-14' },
      { id: 'HLT003', type: 'Vaccination Record', citizen: 'Leo Yellow', status: 'Completed', priority: 'Low', submitted: '2024-01-13' }
    ]
  };

  const departmentConfig = {
    nira: {
      name: 'NIRA (National ID)',
      color: '#4CAF50',
      workflow: ['Document Upload', 'Initial Review', 'Data Verification', 'Background Check', 'Photo Capture', 'Card Printing', 'Ready for Collection'],
      documentTypes: ['ID Application', 'ID Renewal', 'Lost ID Report', 'Birth Certificate', 'Marriage Certificate'],
      processingTime: '7-14 days',
      requirements: ['Valid ID', 'Passport Photo', 'Proof of Residence', 'Birth Certificate']
    },
    ursb: {
      name: 'URSB (Vehicle Registration)',
      color: '#2196F3',
      workflow: ['Document Upload', 'Vehicle Verification', 'Ownership Check', 'Fee Processing', 'License Generation', 'Ready for Collection'],
      documentTypes: ['Vehicle Registration', 'Driving License', 'Ownership Transfer', 'Vehicle Inspection', 'Insurance Document'],
      processingTime: '3-7 days',
      requirements: ['Vehicle Documents', 'Insurance Certificate', 'Payment Proof', 'Valid ID']
    },
    immigration: {
      name: 'Immigration (Passports & Visas)',
      color: '#FF9800',
      workflow: ['Document Upload', 'Identity Verification', 'Biometric Capture', 'Security Clearance', 'Passport Printing', 'Ready for Collection'],
      documentTypes: ['Passport Application', 'Visa Application', 'Work Permit', 'Travel Document', 'Biometric Data'],
      processingTime: '14-21 days',
      requirements: ['Application Form', 'Passport Photos', 'Supporting Documents', 'Biometric Data']
    },
    finance: {
      name: 'Finance (Government Revenue)',
      color: '#9C27B0',
      workflow: ['Document Upload', 'Data Verification', 'Tax Calculation', 'Assessment Review', 'Payment Processing', 'Certificate Generation'],
      documentTypes: ['Tax Return', 'VAT Registration', 'Business Permit', 'Revenue Declaration', 'Financial Statement'],
      processingTime: '5-10 days',
      requirements: ['Financial Records', 'Tax Documents', 'Business Registration', 'Payment Proof']
    },
    health: {
      name: 'Health',
      color: '#F44336',
      workflow: ['Document Upload', 'Medical Review', 'Health Verification', 'Certificate Generation', 'Ready for Collection'],
      documentTypes: ['Medical Certificate', 'Health Permit', 'Vaccination Record', 'Health Facility License', 'Public Health Registration'],
      processingTime: '3-5 days',
      requirements: ['Medical Records', 'Health Documents', 'Valid ID', 'Medical Examination']
    }
  };

  const currentDept = departmentConfig[departmentId as keyof typeof departmentConfig];
  const documents = mockDocuments[departmentId as keyof typeof mockDocuments] || [];

  if (!currentDept) {
    return (
      <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
        <div className="page-content">
          <h1>Department not found</h1>
          <button onClick={() => navigate('/official')}>Back to Departments</button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return '#FFC107';
      case 'Under Review': return '#2196F3';
      case 'Under Verification': return '#FF9800';
      case 'Approved': return '#4CAF50';
      case 'Completed': return '#4CAF50';
      case 'Payment Pending': return '#FF5722';
      case 'Biometrics Pending': return '#9C27B0';
      case 'Under Assessment': return '#607D8B';
      case 'Medical Review': return '#E91E63';
      case 'Document Review': return '#795548';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header">
          <img src={officialImg} alt="Official" className="page-icon" />
          <h1 className="page-title">{currentDept.name} Portal</h1>
          <p className="page-subtitle">Document Processing & Management System</p>
        </div>

        {/* Navigation Tabs */}
        <div className="dept-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            Workflow
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dept-dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Documents</h3>
                <div className="stat-number">{documents.length}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Review</h3>
                <div className="stat-number">{documents.filter(d => d.status.includes('Pending') || d.status.includes('Review')).length}</div>
              </div>
              <div className="stat-card">
                <h3>Completed Today</h3>
                <div className="stat-number">{documents.filter(d => d.status === 'Completed').length}</div>
              </div>
              <div className="stat-card">
                <h3>High Priority</h3>
                <div className="stat-number">{documents.filter(d => d.priority === 'High').length}</div>
              </div>
            </div>

            <div className="recent-documents">
              <h3>Recent Documents</h3>
              <div className="document-list">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="doc-info">
                      <span className="doc-id">{doc.id}</span>
                      <span className="doc-type">{doc.type}</span>
                      <span className="doc-citizen">{doc.citizen}</span>
                    </div>
                    <div className="doc-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(doc.status) }}
                      >
                        {doc.status}
                      </span>
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: getPriorityColor(doc.priority) }}
                      >
                        {doc.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="dept-documents">
            <div className="documents-header">
              <h3>Document Queue</h3>
              <div className="filter-controls">
                <select className="filter-select">
                  <option>All Status</option>
                  <option>Pending Review</option>
                  <option>Under Review</option>
                  <option>Approved</option>
                  <option>Completed</option>
                </select>
                <select className="filter-select">
                  <option>All Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="documents-table">
              <div className="table-header">
                <div>Document ID</div>
                <div>Type</div>
                <div>Citizen</div>
                <div>Status</div>
                <div>Priority</div>
                <div>Submitted</div>
                <div>Actions</div>
              </div>
              {documents.map((doc) => (
                <div key={doc.id} className="table-row">
                  <div className="doc-id">{doc.id}</div>
                  <div className="doc-type">{doc.type}</div>
                  <div className="doc-citizen">{doc.citizen}</div>
                  <div>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(doc.status) }}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="priority-badge" 
                      style={{ backgroundColor: getPriorityColor(doc.priority) }}
                    >
                      {doc.priority}
                    </span>
                  </div>
                  <div className="doc-date">{doc.submitted}</div>
                  <div className="doc-actions">
                    <button className="action-btn-small primary">Review</button>
                    <button className="action-btn-small secondary">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="dept-workflow">
            <h3>Document Processing Workflow</h3>
            <div className="workflow-container">
              <div className="workflow-steps">
                {currentDept.workflow.map((step, index) => (
                  <div key={index} className="workflow-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <h4>{step}</h4>
                      <p>Step {index + 1} of {currentDept.workflow.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="workflow-info">
              <div className="info-card">
                <h4>Document Types</h4>
                <ul>
                  {currentDept.documentTypes.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              </div>
              <div className="info-card">
                <h4>Processing Time</h4>
                <p className="processing-time">{currentDept.processingTime}</p>
              </div>
              <div className="info-card">
                <h4>Requirements</h4>
                <ul>
                  {currentDept.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="dept-settings">
            <h3>Department Settings</h3>
            <div className="settings-grid">
              <div className="setting-card">
                <h4>Notifications</h4>
                <div className="setting-item">
                  <label>Email Notifications</label>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="setting-item">
                  <label>SMS Notifications</label>
                  <input type="checkbox" />
                </div>
              </div>
              <div className="setting-card">
                <h4>Processing Times</h4>
                <div className="setting-item">
                  <label>Default Processing Time</label>
                  <input type="text" defaultValue={currentDept.processingTime} />
                </div>
              </div>
              <div className="setting-card">
                <h4>Team Management</h4>
                <div className="setting-item">
                  <label>Active Officials</label>
                  <span className="setting-value">5</span>
                </div>
                <div className="setting-item">
                  <label>Workload Distribution</label>
                  <select>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="page-actions">
          <button className="action-btn secondary" onClick={() => navigate('/official')}>
            ← Back to Departments
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPortal;