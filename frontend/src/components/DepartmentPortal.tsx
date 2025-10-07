import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import officialImg from '../assets/images/admin.png';
import { User } from '../lib/api';
import './PageStyles.css';

interface DepartmentPortalProps {
  user: User;
}

interface RoutedDocument {
  id: string;
  documentType: string;
  department: string;
  images: string[];
  timestamp: string;
  citizenId: string;
  status: string;
  cardNumber: string;
  description?: string;
  aiExtractedData?: any[];
  aiProcessingTime?: number;
  originalImageCount?: number;
}

const DepartmentPortal: React.FC<DepartmentPortalProps> = ({ user }) => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [routedDocuments, setRoutedDocuments] = useState<RoutedDocument[]>([]);
  const [loading, setLoading] = useState(false);

  // Load routed documents for this department
  useEffect(() => {
    clearMockData();
    loadRoutedDocuments();
  }, [departmentId]);

  // Clear any mock data from localStorage
  const clearMockData = () => {
    try {
      const departmentSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
      let hasChanges = false;
      
      // Clean up each department's submissions
      for (const department in departmentSubmissions) {
        const originalDocs = departmentSubmissions[department];
        const cleanedDocs = originalDocs.filter((doc: RoutedDocument) => {
          // Remove mock data
          const isMock = doc.cardNumber && (
            doc.cardNumber.includes('MOCK') ||
            doc.cardNumber.includes('TEST') ||
            doc.cardNumber.includes('DEMO') ||
            doc.cardNumber.includes('SAMPLE')
          );
          return !isMock;
        });
        
        if (cleanedDocs.length !== originalDocs.length) {
          departmentSubmissions[department] = cleanedDocs;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        localStorage.setItem('departmentSubmissions', JSON.stringify(departmentSubmissions));
        console.log('Cleared mock data from localStorage');
      }
    } catch (error) {
      console.error('Error clearing mock data:', error);
    }
  };

  // Clear only current department's data
  const clearCurrentDepartmentData = () => {
    try {
      const departmentSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
      
      // Only clear the current department's data
      if (departmentId && departmentSubmissions[departmentId]) {
        departmentSubmissions[departmentId] = [];
        localStorage.setItem('departmentSubmissions', JSON.stringify(departmentSubmissions));
        console.log(`Cleared data for ${departmentId} department only`);
        
        // Reload the documents to reflect the changes
        loadRoutedDocuments();
      }
    } catch (error) {
      console.error('Error clearing current department data:', error);
    }
  };

  const loadRoutedDocuments = () => {
    try {
      const departmentSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
      console.log('All department submissions:', departmentSubmissions);
      console.log('Current department ID:', departmentId);
      const currentDepartmentDocs = departmentSubmissions[departmentId || ''] || [];
      
      // Filter out any mock or test data
      const realDocuments = currentDepartmentDocs.filter((doc: RoutedDocument) => {
        // Remove any documents that look like mock data
        const isMock = doc.citizenId === 'citizen_001' && 
                      doc.cardNumber && 
                      doc.cardNumber.includes('MOCK') ||
                      doc.cardNumber.includes('TEST') ||
                      doc.cardNumber.includes('DEMO');
        return !isMock;
      });
      
      console.log('Current department docs (filtered):', realDocuments);
      setRoutedDocuments(realDocuments);
    } catch (error) {
      console.error('Error loading routed documents:', error);
    }
  };

  // Handle document review
  const handleDocumentReview = (document: RoutedDocument) => {
    console.log('Document review clicked:', document);
    console.log('Navigating to:', `/document/${document.cardNumber}`);
    console.log('Card number:', document.cardNumber);
    const encodedCardNumber = encodeURIComponent(document.cardNumber);
    console.log('Encoded card number:', encodedCardNumber);
    navigate(`/document/${encodedCardNumber}`);
  };

  // Update document status
  const updateDocumentStatus = (documentId: string, newStatus: string) => {
    const updatedDocs = routedDocuments.map(doc => 
      doc.id === documentId ? { ...doc, status: newStatus } : doc
    );
    setRoutedDocuments(updatedDocs);
    
    // Update localStorage
    const departmentSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
    departmentSubmissions[departmentId || ''] = updatedDocs;
    localStorage.setItem('departmentSubmissions', JSON.stringify(departmentSubmissions));
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
          <div className="header-content">
          <img src={officialImg} alt="Official" className="official-icon-image" />
            <div className="header-text">
          <h1 className="page-title">{currentDept.name} Portal</h1>
          <p className="page-subtitle">Document Processing & Management System</p>
            </div>
          </div>
          <button 
            className="back-to-departments-btn"
            onClick={() => navigate('/official')}
          >
            ← Back to Departments
          </button>
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
                <h3>Total Card Numbers</h3>
                <div className="stat-number">{routedDocuments.length}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Review</h3>
                <div className="stat-number">{routedDocuments.filter(d => d.status === 'submitted').length}</div>
              </div>
              <div className="stat-card">
                <h3>Under Review</h3>
                <div className="stat-number">{routedDocuments.filter(d => d.status === 'under_review').length}</div>
              </div>
              <div className="stat-card">
                <h3>Approved</h3>
                <div className="stat-number">{routedDocuments.filter(d => d.status === 'approved').length}</div>
              </div>
            </div>

            <div className="recent-documents">
              <h3>Recent Card Numbers</h3>
              <div className="document-list">
                {routedDocuments.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="doc-info">
                      <span className="doc-id">{doc.cardNumber}</span>
                      <span className="doc-type">{doc.documentType.replace('_', ' ').toUpperCase()}</span>
                      <span className="doc-citizen">{doc.citizenId}</span>
                    </div>
                    <div className="doc-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(doc.status) }}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card Numbers Tab */}
        {activeTab === 'documents' && (
          <div className="dept-documents">
            <div className="documents-header">
              <h3>Citizen Card Numbers</h3>
              <p>Click on a card number to view and process the citizen's documents</p>
              <div className="department-info">
                <p>Current Department: <strong>{departmentId?.toUpperCase()}</strong></p>
                <p>Cards in this department: <strong>{routedDocuments.length}</strong></p>
              </div>
              <button 
                className="clear-data-btn"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to clear all data for ${departmentId} department? This will only remove card numbers from this department.`)) {
                    clearCurrentDepartmentData();
                    alert(`${departmentId} department data cleared successfully!`);
                  }
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  fontSize: '0.875rem'
                }}
              >
                🗑️ Clear Department Data
              </button>
            </div>

            {routedDocuments.length === 0 ? (
                <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Card Numbers Yet</h3>
                <p>Card numbers will appear here when citizens submit documents to this department.</p>
                </div>
              ) : (
              <div className="card-numbers-grid">
                {routedDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="card-number-item"
                    onClick={(e) => {
                      console.log('Card clicked:', doc.cardNumber);
                      console.log('Event target:', e.target);
                      handleDocumentReview(doc);
                    }}
                  >
                    <div className="card-number">{doc.cardNumber}</div>
                  </div>
                ))}
              </div>
              )}
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

      <style dangerouslySetInnerHTML={{
        __html: `

          /* Card Numbers Grid Styles */
          .card-numbers-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin-top: 2rem;
          }

          .card-number-item {
            background: var(--glass-bg-light);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80px;
            width: 100%;
          }

          .card-number-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.8s ease;
          }

          .card-number-item:hover::before {
            left: 100%;
          }

          .card-number-item:hover {
            background: var(--glass-bg-medium);
            border-color: rgba(59, 130, 246, 0.5);
            transform: translateY(-4px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          }

          .card-number {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-align: center;
            letter-spacing: 1px;
            font-family: 'Courier New', monospace;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
            width: 100%;
            max-width: 400px;
          }

          .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.7;
          }

          .empty-state h3 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 700;
          }

          .empty-state p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            line-height: 1.6;
          }

          .department-info {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
          }

          .department-info p {
            margin: 0.25rem 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9rem;
          }

          .department-info strong {
            color: #3b82f6;
            font-weight: 700;
          }

          /* Header Layout */
          .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .header-text {
            flex: 1;
          }

          .back-to-departments-btn {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.875rem;
            box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
          }

          .back-to-departments-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .modal-content {
              margin: 0.5rem;
              max-height: calc(100vh - 1rem);
            }

            .modal-header {
              padding: 1rem;
            }

            .modal-body {
              padding: 1rem;
            }

            .info-grid {
              grid-template-columns: 1fr;
            }

            .images-grid {
              grid-template-columns: 1fr;
            }

            .action-buttons {
              flex-direction: column;
            }

            .action-btn {
              width: 100%;
            }

            .card-numbers-grid {
              grid-template-columns: 1fr;
              gap: 0.5rem;
            }

            .card-number-item {
              padding: 0.75rem 1rem;
              min-height: 70px;
            }

            .card-number {
              font-size: 1rem;
              padding: 0.5rem 1rem;
              max-width: 100%;
            }

            .header-content {
              flex-direction: column;
              text-align: center;
              gap: 0.5rem;
            }

            .back-to-departments-btn {
              width: 100%;
              margin-top: 1rem;
            }
          }
        `
      }} />
    </div>
  );
};

export default DepartmentPortal;