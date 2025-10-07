import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import adminIcon from '../assets/images/admin.png';
import { 
  getDocumentStats, 
  getAIPerformanceMetrics, 
  updateDocumentStatus,
  getUserDocuments,
  createNotification,
  DocumentData 
} from '../lib/backend-service';
import { User, admin } from '../lib/api';
import OfficialRegistrationForm from './Admin/OfficialRegistrationForm';
import { db } from '../lib/db';
import './PageStyles.css';
import './Admin/Admin.css';
import '../styles/glassmorphism.css';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [aiMetrics, setAiMetrics] = useState<any>(null);
  const [showOfficialRegistration, setShowOfficialRegistration] = useState(false);
  const [selectedDepartmentForRegistration, setSelectedDepartmentForRegistration] = useState<string>('');
  const [systemStats, setSystemStats] = useState<any>(null);
  const [officials, setOfficials] = useState<any[]>([]);
  const [aiConfig, setAiConfig] = useState({
    confidence_threshold: 0.8,
    processing_enabled: true,
    auto_classification: true,
    fraud_detection: true
  });
  const [aiActionLoading, setAiActionLoading] = useState<string | null>(null);
  const [departmentApprovals, setDepartmentApprovals] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  // Realistic empty state data for brand new system
  const currentStats = systemStats || {
    totalUsers: 0,
    activeSessions: 0,
    documentsProcessed: 0,
    systemUptime: '100%',
    pendingApprovals: 0,
    completedToday: 0,
    aiProcessed: 0,
    aiAccuracy: 0,
    aiProcessingTime: '0s',
    humanReviewRate: 0
  };

  // Load admin data on component mount
  // Load department approvals from localStorage
  const loadDepartmentApprovals = async () => {
    try {
      const allApprovals = await db.approvals.toArray();
      console.log('Loading department approvals from IndexedDB:', allApprovals);
      setDepartmentApprovals(allApprovals);
    } catch (error) {
      console.error('Error loading department approvals:', error);
      setDepartmentApprovals([]);
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const [documentsData, aiMetricsData, statsData] = await Promise.all([
          admin.getDocuments(), // Get all documents for admin review
          getAIPerformanceMetrics(),
          getDocumentStats()
        ]);
        
        setDocuments(documentsData.documents || []);
        setAiMetrics(aiMetricsData);
        setSystemStats(statsData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
    loadDepartmentApprovals();
  }, []);

  const handleOfficialRegistered = (official: any) => {
    console.log('Official registered:', official);
    setOfficials(prev => [...prev, official]);
    setShowOfficialRegistration(false);
    // Show success message
    alert(`Official registered successfully!\nAccess Code: ${official.access_code}\nQR Code sent to ${official.email}`);
  };

  // Department data
  const departments = [
    { id: 'nira', name: 'NIRA (National ID)', description: 'National identification documents and citizen registration services', color: '#e74c3c' },
    { id: 'ursb', name: 'URSB (Vehicle Registration)', description: 'Vehicle registration, driving licenses, and transport documentation', color: '#f39c12' },
    { id: 'immigration', name: 'Immigration (Passports & Visas)', description: 'Passport issuance, visa processing, and immigration services', color: '#3498db' },
    { id: 'finance', name: 'Finance (Government Revenue)', description: 'Revenue documents, tax records, and financial documentation', color: '#2ecc71' },
    { id: 'health', name: 'Health', description: 'Medical records, health certificates, and public health registrations', color: '#9b59b6' }
  ];

  const getDepartmentOfficials = (deptId: string) => {
    if (deptId === 'all') return officials;
    return officials.filter(official => official.department_id === deptId);
  };

  const getDepartmentStats = (deptId: string) => {
    const deptOfficials = getDepartmentOfficials(deptId);
    const deptDocuments = documents.filter(doc => doc.department_id === deptId);
    return {
      officials: deptOfficials.length,
      documents: deptDocuments.length,
      pending: deptDocuments.filter(doc => doc.status === 'ai_processed').length,
      completed: deptDocuments.filter(doc => doc.status === 'Approved').length
    };
  };

  // Admin Functions
  const handleDocumentReview = async (documentId: string, action: 'approve' | 'reject' | 'reassign') => {
    try {
      setLoading(true);
      
      // Call admin review API
      const result = await admin.reviewDocument(documentId, action, reviewComment);
      
      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: result.status as any, admin_review_comment: reviewComment }
          : doc
      ));

      setSelectedDocument(null);
      setReviewComment('');
      alert(`Document ${action}d successfully!`);
      
    } catch (error) {
      console.error('Error reviewing document:', error);
      alert('Error reviewing document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentsByStatus = (status: string) => {
    return documents.filter(doc => doc.status === status);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Submitted': '#f59e0b',
      'ai_processed': '#3b82f6',
      'Under Review': '#8b5cf6',
      'Approved': '#10b981',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (confidence: number, fraudRisk: number) => {
    if (fraudRisk > 0.7) return '#ef4444'; // High fraud risk
    if (confidence < 0.6) return '#f59e0b'; // Low confidence
    if (fraudRisk > 0.4) return '#f97316'; // Medium fraud risk
    return '#10b981'; // Good
  };


  const departmentStats = [
    { name: 'NIRA', documents: 0, completed: 0, pending: 0, efficiency: 0 },
    { name: 'URSB', documents: 0, completed: 0, pending: 0, efficiency: 0 },
    { name: 'Immigration', documents: 0, completed: 0, pending: 0, efficiency: 0 },
    { name: 'Finance', documents: 0, completed: 0, pending: 0, efficiency: 0 },
    { name: 'Health', documents: 0, completed: 0, pending: 0, efficiency: 0 }
  ];

  const handleAIConfigChange = (key: string, value: any) => {
    setAiConfig(prev => ({ ...prev, [key]: value }));
  };


  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header glass-card-lg">
          <img 
            src={adminIcon}
            alt="Admin Portal" 
            className="round-logo"
          />
          <h1 className="page-title">Admin Portal</h1>
          <p className="page-subtitle">System Administration & Management Dashboard</p>
        </div>


        {/* Admin Navigation Tabs */}
        <div className="admin-tabs glass-nav">
          <button 
            className={`glass-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Document Review
            {getDocumentsByStatus('ai_processed').length > 0 && (
              <span className="glass-badge">{getDocumentsByStatus('ai_processed').length}</span>
            )}
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'ai-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-management')}
          >
            AI Management
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'department-approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('department-approvals')}
          >
            Department Approvals
            {departmentApprovals.length > 0 && (
              <span className="glass-badge">{departmentApprovals.length}</span>
            )}
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            System Settings
          </button>
          <button 
            className={`glass-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        {/* Dashboard Tab */}
        {/* Document Review Tab */}
        {activeTab === 'documents' && (
          <div className="admin-document-review">
            <div className="review-header">
              <h2>Document Review Queue</h2>
              <div className="review-stats">
                <span className="stat-item pending">
                  Pending: {getDocumentsByStatus('ai_processed').length}
                </span>
                <span className="stat-item under-review">
                  Under Review: {getDocumentsByStatus('Under Review').length}
                </span>
                <span className="stat-item approved">
                  Approved: {getDocumentsByStatus('Approved').length}
                </span>
                <span className="stat-item rejected">
                  Rejected: {getDocumentsByStatus('Rejected').length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <p>Loading documents...</p>
              </div>
            ) : (
              <div className="documents-queue">
                {getDocumentsByStatus('ai_processed').map((doc) => (
                  <div key={doc.id} className="document-review-card">
                    <div className="document-header">
                      <div className="document-info">
                        <h4>{doc.document_type}</h4>
                        <p>Submitted: {new Date(doc.created_at || '').toLocaleString()}</p>
                        <p>Department: {doc.department_id.toUpperCase()}</p>
                      </div>
                      <div className="document-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(doc.status) }}
                        >
                          {typeof doc.status === 'string' ? doc.status : String(doc.status)}
                        </span>
                        <div 
                          className="priority-indicator"
                          style={{ 
                            backgroundColor: getPriorityColor(
                              doc.ai_confidence || 0, 
                              doc.ai_fraud_risk || 0
                            )
                          }}
                        >
                          {doc.ai_fraud_risk && doc.ai_fraud_risk > 0.7 ? 'HIGH RISK' : 
                           doc.ai_confidence && doc.ai_confidence < 0.6 ? 'LOW CONFIDENCE' : 'NORMAL'}
                        </div>
                      </div>
                    </div>

                    <div className="ai-results-summary">
                      <div className="ai-metric">
                        <span className="metric-label">AI Confidence:</span>
                        <span className="metric-value">
                          {Math.round((doc.ai_confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="ai-metric">
                        <span className="metric-label">Quality Score:</span>
                        <span className="metric-value">
                          {Math.round((doc.ai_quality_score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="ai-metric">
                        <span className="metric-label">Fraud Risk:</span>
                        <span className="metric-value">
                          {Math.round((doc.ai_fraud_risk || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="document-actions">
                      <button 
                        className="glass-btn glass-btn-primary"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        Review Details
                      </button>
                      <button 
                        className="glass-btn glass-btn-success"
                        onClick={() => handleDocumentReview(doc.id!, 'approve')}
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button 
                        className="glass-btn glass-btn-warning"
                        onClick={() => handleDocumentReview(doc.id!, 'reassign')}
                        disabled={loading}
                      >
                        Reassign
                      </button>
                      <button 
                        className="glass-btn glass-btn-error"
                        onClick={() => setSelectedDocument(doc)}
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}

                {getDocumentsByStatus('ai_processed').length === 0 && (
                  <div className="empty-state">
                    <p>No documents pending review</p>
                  </div>
                )}
              </div>
            )}

            {/* Document Review Modal */}
            {selectedDocument && (
              <div className="review-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Review Document: {selectedDocument.document_type}</h3>
                    <button 
                      className="close-btn"
                      onClick={() => setSelectedDocument(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="modal-body">
                    <div className="document-images">
                      <h4>Document Images</h4>
                      <div className="images-grid">
                        {selectedDocument.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`Document ${index + 1}`}
                            className="review-image"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="ai-analysis">
                      <h4>AI Analysis Results</h4>
                      <div className="analysis-grid">
                        <div className="analysis-item">
                          <span className="label">Document Type:</span>
                          <span className="value">{selectedDocument.document_type}</span>
                        </div>
                        <div className="analysis-item">
                          <span className="label">Confidence:</span>
                          <span className="value">{Math.round((selectedDocument.ai_confidence || 0) * 100)}%</span>
                        </div>
                        <div className="analysis-item">
                          <span className="label">Quality Score:</span>
                          <span className="value">{Math.round((selectedDocument.ai_quality_score || 0) * 100)}%</span>
                        </div>
                        <div className="analysis-item">
                          <span className="label">Fraud Risk:</span>
                          <span className="value">{Math.round((selectedDocument.ai_fraud_risk || 0) * 100)}%</span>
                        </div>
                      </div>

                      {selectedDocument.ai_extracted_fields && (
                        <div className="extracted-fields">
                          <h5>Extracted Information:</h5>
                          <div className="fields-grid">
                            {Object.entries(selectedDocument.ai_extracted_fields).map(([key, value]) => (
                              <div key={key} className="field-item">
                                <span className="field-key">{key}:</span>
                                <span className="field-value">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDocument.ai_recommendations && selectedDocument.ai_recommendations.length > 0 && (
                        <div className="recommendations">
                          <h5>AI Recommendations:</h5>
                          <ul>
                            {selectedDocument.ai_recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedDocument.ai_issues && selectedDocument.ai_issues.length > 0 && (
                        <div className="issues">
                          <h5>Issues Found:</h5>
                          <ul>
                            {selectedDocument.ai_issues.map((issue, index) => (
                              <li key={index} className="issue-item">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="review-comment">
                      <label htmlFor="review-comment">Review Comment:</label>
                      <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Add your review comments here..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="glass-btn glass-btn-success"
                      onClick={() => handleDocumentReview(selectedDocument.id!, 'approve')}
                      disabled={loading}
                    >
                      Approve Document
                    </button>
                    <button 
                      className="glass-btn glass-btn-warning"
                      onClick={() => handleDocumentReview(selectedDocument.id!, 'reassign')}
                      disabled={loading}
                    >
                      Reassign to Department
                    </button>
                    <button 
                      className="glass-btn glass-btn-error"
                      onClick={() => handleDocumentReview(selectedDocument.id!, 'reject')}
                      disabled={loading}
                    >
                      Reject Document
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Management Tab */}
        {activeTab === 'ai-management' && (
          <div className="admin-ai-management">
            <h2>AI Management Console</h2>
            
            <div className="ai-metrics-grid">
              <div className="metric-card">
                <h3>AI Performance</h3>
                <div className="metric-value">
                  {aiMetrics ? 
                    `${Math.round((aiMetrics.reduce((sum: number, m: any) => sum + (m.ai_confidence || 0), 0) / aiMetrics.length) * 100)}%` : 
                    'Loading...'
                  }
                </div>
                <p>Average Confidence</p>
              </div>
              
              <div className="metric-card">
                <h3>Processing Speed</h3>
                <div className="metric-value">
                  {aiMetrics ? 
                    `${(aiMetrics.reduce((sum: number, m: any) => sum + parseFloat(m.ai_processing_time || '0'), 0) / aiMetrics.length).toFixed(1)}s` : 
                    'Loading...'
                  }
                </div>
                <p>Average Processing Time</p>
              </div>
              
              <div className="metric-card">
                <h3>Quality Score</h3>
                <div className="metric-value">
                  {aiMetrics ? 
                    `${Math.round((aiMetrics.reduce((sum: number, m: any) => sum + (m.ai_quality_score || 0), 0) / aiMetrics.length) * 100)}%` : 
                    'Loading...'
                  }
                </div>
                <p>Average Quality</p>
              </div>
              
              <div className="metric-card">
                <h3>Fraud Detection</h3>
                <div className="metric-value">
                  {aiMetrics ? 
                    `${Math.round((aiMetrics.reduce((sum: number, m: any) => sum + (m.ai_fraud_risk || 0), 0) / aiMetrics.length) * 100)}%` : 
                    'Loading...'
                  }
                </div>
                <p>Average Fraud Risk</p>
              </div>
            </div>

            <div className="ai-config-section">
              <h3>AI Configuration</h3>
              <div className="config-item">
                <label>Confidence Threshold</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="0.95" 
                  step="0.05" 
                  value={aiConfig.confidence_threshold} 
                  onChange={(e) => handleAIConfigChange('confidence_threshold', parseFloat(e.target.value))} 
                />
                <span>{Math.round(aiConfig.confidence_threshold * 100)}%</span>
              </div>
              <div className="config-item">
                <label>AI Processing Enabled</label>
                <input 
                  type="checkbox" 
                  checked={aiConfig.processing_enabled} 
                  onChange={(e) => handleAIConfigChange('processing_enabled', e.target.checked)} 
                />
              </div>
              <div className="config-item">
                <label>Auto-Classification</label>
                <input 
                  type="checkbox" 
                  checked={aiConfig.auto_classification} 
                  onChange={(e) => handleAIConfigChange('auto_classification', e.target.checked)} 
                />
              </div>
              <div className="config-item">
                <label>Fraud Detection</label>
                <input 
                  type="checkbox" 
                  checked={aiConfig.fraud_detection} 
                  onChange={(e) => handleAIConfigChange('fraud_detection', e.target.checked)} 
                />
              </div>
              <button 
                className="glass-btn glass-btn-primary"
                onClick={() => alert('AI configuration updated!')}
              >
                Update Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            {/* System Overview Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{(currentStats.totalUsers || 0).toLocaleString()}</div>
                <div className="stat-change neutral">System ready</div>
              </div>
              <div className="stat-card">
                <h3>Active Sessions</h3>
                <div className="stat-number">{currentStats.activeSessions || 0}</div>
                <div className="stat-change neutral">Live now</div>
              </div>
              <div className="stat-card">
                <h3>Documents Processed</h3>
                <div className="stat-number">{(currentStats.documentsProcessed || 0).toLocaleString()}</div>
                <div className="stat-change neutral">Awaiting first document</div>
              </div>
              <div className="stat-card">
                <h3>System Uptime</h3>
                <div className="stat-number">{currentStats.systemUptime || '0%'}</div>
                <div className="stat-change positive">Excellent</div>
              </div>
              <div className="stat-card">
                <h3>Pending Approvals</h3>
                <div className="stat-number">{currentStats.pendingApprovals || 0}</div>
                <div className="stat-change neutral">No pending reviews</div>
              </div>
              <div className="stat-card">
                <h3>Completed Today</h3>
                <div className="stat-number">{currentStats.completedToday || 0}</div>
                <div className="stat-change neutral">No completions yet</div>
              </div>
              <div className="stat-card ai-card">
                <h3>AI Processed</h3>
                <div className="stat-number">{currentStats.aiProcessed || 0}</div>
                <div className="stat-change neutral">AI ready for first document</div>
              </div>
              <div className="stat-card ai-card">
                <h3>AI Accuracy</h3>
                <div className="stat-number">{currentStats.aiAccuracy || 0}%</div>
                <div className="stat-change neutral">No data yet</div>
              </div>
              <div className="stat-card ai-card">
                <h3>Avg Processing Time</h3>
                <div className="stat-number">{currentStats.aiProcessingTime || '0s'}</div>
                <div className="stat-change neutral">No processing data yet</div>
              </div>
              <div className="stat-card ai-card">
                <h3>Human Review Rate</h3>
                <div className="stat-number">{currentStats.humanReviewRate || 0}%</div>
                <div className="stat-change neutral">No review data yet</div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="department-performance">
              <h3>Department Performance</h3>
              <div className="performance-grid">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="performance-card">
                    <div className="dept-header">
                      <h4>{dept.name}</h4>
                      <span className="efficiency-badge">{dept.efficiency}%</span>
                    </div>
                    <div className="dept-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Documents</span>
                        <span className="stat-value">{dept.documents}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value success">{dept.completed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value warning">{dept.pending}</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${dept.efficiency}%`,
                          backgroundColor: dept.efficiency > 90 ? '#10b981' : dept.efficiency > 80 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Alerts */}
            <div className="admin-activity-grid">
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="empty-state">
                  <p>No recent activity yet. Activity will appear here as users interact with the system.</p>
                </div>
              </div>

              <div className="system-alerts">
                <h3>System Alerts</h3>
                <div className="empty-state">
                  <p>No system alerts. All systems are running normally.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="users-header">
              <h3>User Management</h3>
              <div className="user-actions">
                <div className="registration-controls">
                  <select 
                    className="department-select"
                    value={selectedDepartmentForRegistration}
                    onChange={(e) => setSelectedDepartmentForRegistration(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="nira">NIRA (National ID)</option>
                    <option value="ursb">URSB (Vehicle Registration)</option>
                    <option value="immigration">Immigration (Passports & Visas)</option>
                    <option value="finance">Finance (Government Revenue)</option>
                    <option value="health">Health</option>
                  </select>
                  <button 
                    className="glass-btn glass-btn-primary"
                    onClick={() => setShowOfficialRegistration(true)}
                    disabled={!selectedDepartmentForRegistration}
                  >
                    Register Official
                  </button>
                </div>
                <button className="glass-btn glass-btn-secondary">Export Users</button>
              </div>
            </div>
            
            <div className="users-filters">
              <select className="filter-select">
                <option>All Roles</option>
                <option>Citizens</option>
                <option>Officials</option>
                <option>Admins</option>
              </select>
              <select className="filter-select">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
              <input type="text" placeholder="Search users..." className="search-input" />
            </div>

            <div className="users-table">
              <div className="table-header">
                <div>User</div>
                <div>Role</div>
                <div>Department</div>
                <div>Status</div>
                <div>Last Active</div>
                <div>Actions</div>
              </div>
              <div className="empty-state">
                <p>No users registered yet. Users will appear here once they start using the system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Department Approvals Tab */}
        {activeTab === 'department-approvals' && (
          <div className="admin-department-approvals">
            <div className="approvals-header glass-card">
              <h3>Department Approval Results</h3>
              <p>Review approval decisions made by department officials</p>
              <div className="approval-filters">
                <select 
                  value={selectedDepartment} 
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="glass-select"
                >
                  <option value="all">All Departments</option>
                  <option value="nira">NIRA</option>
                  <option value="ursb">URSB</option>
                  <option value="immigration">Immigration</option>
                  <option value="finance">Finance</option>
                  <option value="health">Health</option>
                </select>
              </div>
            </div>

            <div className="approvals-grid">
              {departmentApprovals
                .filter(approval => selectedDepartment === 'all' || approval.department === selectedDepartment)
                .map((approval) => (
                  <div key={approval.id} className="approval-card glass-card">
                    <div className="approval-header">
                      <div className="approval-info">
                        <h4>Card: {approval.cardNumber}</h4>
                        <p className="approval-department">{approval.department.toUpperCase()}</p>
                        <p className="approval-document">{approval.documentType.replace('_', ' ')}</p>
                      </div>
                      <div className="approval-status">
                        <span 
                          className={`status-badge ${approval.status}`}
                          style={{
                            backgroundColor: approval.status === 'approved' ? '#10b981' : 
                                           approval.status === 'rejected' ? '#ef4444' : '#f59e0b'
                          }}
                        >
                          {approval.status.toUpperCase()}
                        </span>
                        <p className="approval-time">
                          {new Date(approval.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="approval-feedback">
                      <h5>Feedback:</h5>
                      <p className="feedback-message">{approval.feedback.message}</p>
                      <p className="feedback-action">{approval.feedback.action}</p>
                      <p className="feedback-next">{approval.feedback.nextSteps}</p>
                      <div className="feedback-priority">
                        <span className={`priority-badge ${approval.feedback.priority}`}>
                          {approval.feedback.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>

                    <div className="approval-actions">
                      <button 
                        className="glass-btn glass-btn-primary"
                        onClick={() => {
                          // Navigate to document review page
                          const cardNumber = approval.cardNumber;
                          console.log('AdminPage: Navigating to view document with card number:', cardNumber);
                          navigate(`/document-review/${encodeURIComponent(cardNumber)}`);
                        }}
                      >
                        View Document
                      </button>
                      <button 
                        className="glass-btn glass-btn-secondary"
                        onClick={async () => {
                          try {
                            await createNotification({
                              user_id: approval.citizenId,
                              document_id: approval.id,
                              title: 'A message from the admin',
                              message: `The administrator has reviewed your document submission #${approval.cardNumber}.`,
                              type: 'info',
                              read: false
                            });
                            alert('Notification sent to citizen!');
                          } catch (error) {
                            console.error('Failed to send notification:', error);
                            alert('Failed to send notification. Please try again.');
                          }
                        }}
                      >
                        Notify Citizen
                      </button>
                    </div>
                  </div>
                ))}

              {departmentApprovals.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Department Approvals Yet</h3>
                  <p>Approval results will appear here when officials make decisions on submitted documents.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="admin-departments">
            <div className="departments-header glass-card">
            <h3>Department Management</h3>
              <p>Manage officials and view reports for each department</p>
            </div>
            
            <div className="departments-admin-grid">
              {departments.map((dept, index) => {
                const deptStats = getDepartmentStats(dept.id);
                return (
                  <div key={index} className="dept-admin-card glass-card">
                  <div className="dept-admin-header">
                    <h4>{dept.name}</h4>
                    <span className="dept-status active">Active</span>
                  </div>
                    <div className="dept-description">
                      <p>{dept.description}</p>
                    </div>
                  <div className="dept-metrics">
                    <div className="metric">
                        <span className="metric-label">Officials</span>
                        <span className="metric-value">{deptStats.officials}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Documents</span>
                        <span className="metric-value">{deptStats.documents}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Pending</span>
                        <span className="metric-value">{deptStats.pending}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Completed</span>
                        <span className="metric-value">{deptStats.completed}</span>
                    </div>
                  </div>
                  <div className="dept-actions">
                      <button 
                        className="glass-btn glass-btn-primary glass-btn-sm"
                        onClick={() => {
                          setSelectedDepartmentForRegistration(dept.id);
                          setShowOfficialRegistration(true);
                        }}
                      >
                        Register Official
                      </button>
                      <button 
                        className="glass-btn glass-btn-secondary glass-btn-sm"
                        onClick={() => {
                          // TODO: Implement reports functionality
                          alert(`Reports for ${dept.name} - Coming soon!`);
                        }}
                      >
                        View Reports
                      </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="admin-analytics">
            <h3>System Analytics</h3>
            <div className="analytics-grid">
              <div className="chart-container glass-card">
                <h4>Document Processing Trends</h4>
                <div className="chart-placeholder">
                  Chart visualization would go here
                </div>
              </div>
              <div className="chart-container glass-card">
                <h4>User Activity</h4>
                <div className="chart-placeholder">
                  Activity chart would go here
                </div>
              </div>
              <div className="chart-container glass-card">
                <h4>Department Performance</h4>
                <div className="chart-placeholder">
                  Performance chart would go here
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="admin-settings">
            <h3>System Settings</h3>
            <div className="settings-sections">
              <div className="setting-section">
                <h4>General Settings</h4>
                <div className="setting-item">
                  <label>System Name</label>
                  <input type="text" defaultValue="PublicPulse" />
                </div>
                <div className="setting-item">
                  <label>Maintenance Mode</label>
                  <input type="checkbox" />
                </div>
              </div>
              <div className="setting-section">
                <h4>Document Settings</h4>
                <div className="setting-item">
                  <label>Max File Size (MB)</label>
                  <input type="number" defaultValue="10" />
                </div>
                <div className="setting-item">
                  <label>Auto-approve Threshold</label>
                  <input type="number" defaultValue="90" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="admin-security">
            <h3>Security Dashboard</h3>
            <div className="security-grid">
              <div className="security-card">
                <h4>Login Attempts</h4>
                <div className="security-metric">23 failed attempts today</div>
              </div>
              <div className="security-card">
                <h4>Active Sessions</h4>
                <div className="security-metric">{currentStats.activeSessions || 0} active</div>
              </div>
              <div className="security-card">
                <h4>Security Score</h4>
                <div className="security-metric">95/100</div>
              </div>
            </div>
          </div>
        )}

      </div>

                  {/* Official Registration Modal */}
                  {showOfficialRegistration && (
                    <OfficialRegistrationForm
                      onOfficialRegistered={handleOfficialRegistered}
                      onCancel={() => {
                        setShowOfficialRegistration(false);
                        setSelectedDepartmentForRegistration('');
                      }}
                      selectedDepartment={selectedDepartmentForRegistration}
                    />
                  )}
    </div>
  );
};

export default AdminPage;