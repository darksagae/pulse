import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import officialIcon from '../assets/images/official.png';
import { User } from '../lib/api';
import './PageStyles.css';
import '../styles/glassmorphism.css';

// Ensure this file is treated as a module
export {};

interface DocumentQueueItem {
  id: string;
  document_id: string;
  department_id: string;
  assigned_official_id?: string;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_review' | 'completed' | 'escalated';
  ai_processed: boolean;
  ai_confidence: number;
  ai_classification: any;
  ai_extracted_data: any;
  ai_fraud_risk: number;
  created_at: string;
  assigned_at?: string;
  estimated_completion?: string;
  actual_completion?: string;
  processing_notes?: string;
}

interface WorkloadStats {
  total_officials: number;
  available_officials: number;
  total_capacity: number;
  current_documents: number;
  utilization_percentage: number;
  average_utilization: number;
}

const OfficialDashboard: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const [activeTab, setActiveTab] = useState('queue');
  const [documents, setDocuments] = useState<DocumentQueueItem[]>([]);
  const [workloadStats, setWorkloadStats] = useState<WorkloadStats>({
    total_officials: 0,
    available_officials: 0,
    total_capacity: 0,
    current_documents: 0,
    utilization_percentage: 0,
    average_utilization: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Department mapping
  const departmentMap: { [key: string]: { name: string; letter: string; color: string } } = {
    'nira': { name: 'NIRA', letter: 'N', color: '#e74c3c' },
    'ursb': { name: 'URSB', letter: 'U', color: '#f39c12' },
    'immigration': { name: 'Immigration', letter: 'I', color: '#3498db' },
    'finance': { name: 'Finance', letter: 'F', color: '#2ecc71' },
    'health': { name: 'Health', letter: 'H', color: '#9b59b6' }
  };

  const currentDepartment = departmentMap[deptId || 'nira'] || departmentMap['nira'];
  const [selectedDocument, setSelectedDocument] = useState<DocumentQueueItem | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [processingNotes, setProcessingNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    const departmentId = deptId || 'nira';
    
    setLoading(true);
    setError(null);
    
    try {
      // Load department documents
      const documentsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/documents/department/${departmentId}`);
      const documentsData = await documentsResponse.json();
      
      console.log('Department documents response:', documentsData);
      
      if (documentsData.documents && Array.isArray(documentsData.documents)) {
        // Convert API data to DocumentQueueItem format
        const queueItems: DocumentQueueItem[] = documentsData.documents.map((doc: any) => ({
          id: doc.id,
          document_id: doc.document_id,
          department_id: doc.department_id,
          assigned_official_id: doc.assigned_official_id,
          priority_level: doc.priority || 'medium',
          status: doc.status === 'submitted' ? 'pending' : doc.status,
          ai_processed: doc.ai_processed || false,
          ai_confidence: doc.ai_confidence || 0,
          ai_classification: doc.ai_classification || null,
          ai_extracted_data: doc.ai_extracted_data || {},
          ai_fraud_risk: doc.ai_fraud_risk || 0,
          created_at: doc.created_at,
          assigned_at: doc.assigned_at,
          estimated_completion: doc.estimated_completion,
          actual_completion: doc.actual_completion,
          processing_notes: doc.processing_notes || '',
          escalation_reason: doc.escalation_reason
        }));
        
        setDocuments(queueItems);
        
        // Update workload stats based on real data - department specific
        const departmentOfficials = {
          'nira': 8,
          'ursb': 6,
          'immigration': 10,
          'finance': 5,
          'health': 7
        };
        
        const totalOfficials = departmentOfficials[departmentId as keyof typeof departmentOfficials] || 8;
        const availableOfficials = Math.max(0, totalOfficials - Math.floor(queueItems.length / 3)); // 3 docs per official
        const totalCapacity = totalOfficials * 15; // 15 docs per official capacity
        const utilizationPercentage = Math.min(100, (queueItems.length / totalCapacity) * 100);
        const averageUtilization = queueItems.length / totalOfficials;
        
        console.log('Setting workload stats:', {
          departmentId,
          totalOfficials,
          availableOfficials,
          currentDocuments: queueItems.length,
          utilizationPercentage,
          totalCapacity,
          averageUtilization
        });
        
        setWorkloadStats({
          total_officials: 0, // No mock data
          available_officials: 0, // No mock data
          current_documents: queueItems.length,
          utilization_percentage: 0, // No mock data
          total_capacity: 0, // No mock data
          average_utilization: 0 // No mock data
        });
      } else {
        setError('Failed to load documents');
        // Set default stats even when API fails - no mock data
        setWorkloadStats({
          total_officials: 0, // No mock data
          available_officials: 0, // No mock data
          current_documents: 0,
          utilization_percentage: 0, // No mock data
          total_capacity: 0, // No mock data
          average_utilization: 0 // No mock data
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to connect to server');
      // Set default stats even when there's an error - no mock data
      setWorkloadStats({
        total_officials: 0, // No mock data
        available_officials: 0, // No mock data
        current_documents: 0,
        utilization_percentage: 0, // No mock data
        total_capacity: 0, // No mock data
        average_utilization: 0 // No mock data
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedDocument || !newStatus) return;

    try {
      // Update document status using our new API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/documents/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: selectedDocument.id,
          status: newStatus,
          official_id: 'official_001',
          notes: processingNotes
        }),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Refresh data
        loadDashboardData();
        setShowDocumentDetails(false);
        setSelectedDocument(null);
        setProcessingNotes('');
        setNewStatus('');
      } else {
        setError('Failed to update document status');
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      setError('Failed to update document status');
    }
  };

  const handleAssignDocument = async (documentId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/documents/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          official_id: 'official_001',
          department_id: deptId || 'nira'
        }),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Refresh data to show updated assignment
        loadDashboardData();
      } else {
        setError('Failed to assign document');
      }
    } catch (error) {
      console.error('Error assigning document:', error);
      setError('Failed to assign document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'assigned': return '#3b82f6';
      case 'in_review': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'escalated': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getFraudRiskColor = (risk: number) => {
    if (risk < 0.1) return '#10b981';
    if (risk < 0.3) return '#f59e0b';
    return '#ef4444';
  };


  const openDocumentDetails = (document: DocumentQueueItem) => {
    setSelectedDocument(document);
    setShowDocumentDetails(true);
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header glass-card-lg">
          <img 
            src={officialIcon}
            alt="" 
            className="round-logo"
          />
          <div className="department-badge" style={{ backgroundColor: currentDepartment.color }}>
            <div 
              className="department-letter" 
              style={{ 
                background: `linear-gradient(135deg, ${currentDepartment.color} 0%, ${currentDepartment.color}dd 100%)`,
                boxShadow: `0 8px 32px ${currentDepartment.color}40`
              }}
            >
              {currentDepartment.letter}
            </div>
            <span className="department-name">{currentDepartment.name}</span>
          </div>
          <h1 className="page-title">Official {currentDepartment.name} Dashboard</h1>
        </div>

        {error && (
          <div className="error-message" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            margin: '16px',
            textAlign: 'center'
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="official-tabs glass-card">
          <button 
            className={`tab-btn glass-button ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Document Queue
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            My Documents
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'workload' ? 'active' : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            Workload Stats
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'ai-insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-insights')}
          >
            AI Insights
          </button>
        </div>

        {/* Document Queue Tab */}
        {activeTab === 'queue' && (
          <div className="official-queue">
            <div className="section-header glass-card">
              <h3>Document Queue</h3>
              <p>Documents awaiting processing in your department</p>
              <div className="queue-stats">
                <span className="stat-item">
                  <strong>Pending:</strong> {documents.filter(d => d.status === 'pending').length}
                </span>
                <span className="stat-item">
                  <strong>Under Review:</strong> {documents.filter(d => d.status === 'in_review').length}
                </span>
                <span className="stat-item">
                  <strong>Approved:</strong> {documents.filter(d => d.status === 'completed').length}
                </span>
                <span className="stat-item">
                  <strong>Rejected:</strong> {documents.filter(d => d.status === 'escalated').length}
                </span>
              </div>
            </div>

            <div className="documents-queue">
              {loading ? (
                <div className="loading-state">
                  <p>Loading documents...</p>
                </div>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="queue-item glass-card">
                    <div className="queue-item-header">
                      <div className="priority-badge" style={{ backgroundColor: getPriorityColor(doc.priority_level) }}>
                        {doc.priority_level.toUpperCase()}
                      </div>
                      <div className="status-badge" style={{ backgroundColor: getStatusColor(doc.status) }}>
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </div>
                      {doc.ai_processed && (
                        <div className="ai-badge">
                          AI Processed ({Math.round(doc.ai_confidence * 100)}%)
                        </div>
                      )}
                    </div>

                    <div className="queue-item-content">
                      <h4>Document ID: {doc.document_id}</h4>
                      <p><strong>Department:</strong> {doc.department_id.toUpperCase()}</p>
                      <p><strong>Submitted:</strong> {new Date(doc.created_at).toLocaleDateString()}</p>
                      {doc.estimated_completion && (
                        <p><strong>Estimated Completion:</strong> {new Date(doc.estimated_completion).toLocaleDateString()}</p>
                      )}
                    </div>

                    {doc.ai_processed && (
                      <div className="ai-insights">
                        <h5>AI Analysis:</h5>
                        <div className="ai-metrics">
                          <div className="metric">
                            <span className="metric-label">Confidence:</span>
                            <span className="metric-value">{Math.round(doc.ai_confidence * 100)}%</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Fraud Risk:</span>
                            <span 
                              className="metric-value" 
                              style={{ color: getFraudRiskColor(doc.ai_fraud_risk) }}
                            >
                              {Math.round(doc.ai_fraud_risk * 100)}%
                            </span>
                          </div>
                        </div>
                        {doc.ai_extracted_data && (
                          <div className="extracted-data">
                            <h6>Extracted Information:</h6>
                            <div className="data-grid">
                              {Object.entries(doc.ai_extracted_data).map(([key, value]) => (
                                <div key={key} className="data-item">
                                  <span className="data-label">{key}:</span>
                                  <span className="data-value">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="queue-item-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => openDocumentDetails(doc)}
                      >
                        View Details
                      </button>
                      {!doc.assigned_official_id && (
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleAssignDocument(doc.id)}
                        >
                          Assign to Me
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No documents in queue</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Documents Tab */}
        {activeTab === 'assigned' && (
          <div className="my-documents">
            <div className="section-header glass-card">
              <h3>My Assigned Documents</h3>
              <p>Documents assigned to you for processing</p>
            </div>

            <div className="assigned-documents">
              {documents.filter(d => d.assigned_official_id === 'official_001').length > 0 ? (
                documents.filter(d => d.assigned_official_id === 'official_001').map((doc) => (
                  <div key={doc.id} className="assigned-item glass-card">
                    <div className="assigned-header">
                      <h4>Document ID: {doc.document_id}</h4>
                      <div className="status-badge" style={{ backgroundColor: getStatusColor(doc.status) }}>
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="assigned-content">
                      <p><strong>Priority:</strong> {doc.priority_level.toUpperCase()}</p>
                      <p><strong>Assigned:</strong> {doc.assigned_at ? new Date(doc.assigned_at).toLocaleDateString() : 'N/A'}</p>
                      {doc.ai_processed && (
                        <div className="ai-summary">
                          <p><strong>AI Confidence:</strong> {Math.round(doc.ai_confidence * 100)}%</p>
                          <p><strong>Fraud Risk:</strong> 
                            <span style={{ color: getFraudRiskColor(doc.ai_fraud_risk) }}>
                              {Math.round(doc.ai_fraud_risk * 100)}%
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="assigned-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => openDocumentDetails(doc)}
                      >
                        Process Document
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No documents assigned to you</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workload Stats Tab */}
        {activeTab === 'workload' && (
          <div className="workload-stats">
            <div className="section-header glass-card">
              <h3>Department Workload Statistics</h3>
              <p>Current workload distribution and capacity</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass-card">
                <h3>Total Officials</h3>
                <div className="stat-number">{workloadStats.total_officials === 0 ? 'none' : workloadStats.total_officials}</div>
              </div>
              <div className="stat-card glass-card">
                <h3>Available Officials</h3>
                <div className="stat-number">{workloadStats.available_officials === 0 ? 'none' : workloadStats.available_officials}</div>
              </div>
              <div className="stat-card glass-card">
                <h3>Current Documents</h3>
                <div className="stat-number">{workloadStats.current_documents}</div>
              </div>
              <div className="stat-card glass-card">
                <h3>Utilization</h3>
                <div className="stat-number">{workloadStats.utilization_percentage}%</div>
              </div>
            </div>

            <div className="workload-details glass-card">
              <h4>Capacity Details</h4>
              <div className="capacity-info">
                <p><strong>Total Capacity:</strong> {workloadStats.total_capacity === 0 ? 'none' : `${workloadStats.total_capacity} documents`}</p>
                <p><strong>Current Load:</strong> {workloadStats.current_documents} documents</p>
                <p><strong>Available Capacity:</strong> {workloadStats.total_capacity === 0 ? 'none' : `${workloadStats.total_capacity - workloadStats.current_documents} documents`}</p>
                <p><strong>Average Utilization:</strong> {workloadStats.average_utilization === 0 ? 'none' : `${workloadStats.average_utilization} documents per official`}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div className="ai-insights">
            <div className="section-header glass-card">
              <h3>AI Processing Insights</h3>
              <p>AI analysis and recommendations for document processing</p>
            </div>

            <div className="insights-grid">
              <div className="insight-card glass-card">
                <h4>Processing Accuracy</h4>
                <p>AI confidence levels across all processed documents</p>
                <div className="accuracy-metric">
                  <span className="metric-value">94.2%</span>
                  <span className="metric-label">Average Confidence</span>
                </div>
              </div>

              <div className="insight-card glass-card">
                <h4>Fraud Detection</h4>
                <p>Documents flagged for potential fraud</p>
                <div className="fraud-metric">
                  <span className="metric-value">2.3%</span>
                  <span className="metric-label">High Risk Documents</span>
                </div>
              </div>

              <div className="insight-card glass-card">
                <h4>Processing Speed</h4>
                <p>Average AI processing time</p>
                <div className="speed-metric">
                  <span className="metric-value">2.1s</span>
                  <span className="metric-label">Per Document</span>
                </div>
              </div>

              <div className="insight-card glass-card">
                <h4>Efficiency Gain</h4>
                <p>Time saved through AI processing</p>
                <div className="efficiency-metric">
                  <span className="metric-value">67%</span>
                  <span className="metric-label">Faster Processing</span>
                </div>
              </div>
            </div>

            <div className="ai-recommendations glass-card">
              <h4>AI Recommendations</h4>
              <div className="recommendations-list">
                <div className="recommendation-item">
                  <div className="recommendation-content">
                    <h5>High Confidence Documents</h5>
                    <p>Documents with &gt;95% AI confidence can be fast-tracked for approval</p>
                  </div>
                </div>
                <div className="recommendation-item">
                  <div className="recommendation-content">
                    <h5>Manual Review Required</h5>
                    <p>Documents with &lt;80% confidence or &gt;30% fraud risk need manual verification</p>
                  </div>
                </div>
                <div className="recommendation-item">
                  <div className="recommendation-content">
                    <h5>Quality Improvement</h5>
                    <p>Consider requesting higher quality document images for better AI processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Details Modal */}
        {showDocumentDetails && selectedDocument && (
          <div className="modal-overlay">
            <div className="modal-content glass-card">
              <div className="modal-header">
                <h3>Document Processing</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowDocumentDetails(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="document-info">
                  <h4>Document ID: {selectedDocument.document_id}</h4>
                  <p><strong>Priority:</strong> {selectedDocument.priority_level.toUpperCase()}</p>
                  <p><strong>Status:</strong> {selectedDocument.status.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Department:</strong> {selectedDocument.department_id.toUpperCase()}</p>
                </div>

                {selectedDocument.ai_processed && (
                  <div className="ai-analysis">
                    <h4>AI Analysis Results</h4>
                    
                    {/* Processing Metrics */}
                    <div className="ai-metrics-section">
                      <h5>Processing Metrics</h5>
                      <div className="metrics-grid">
                        <div className="metric-card">
                          <div className="metric-title">Confidence Score</div>
                          <div className="metric-value">{Math.round(selectedDocument.ai_confidence * 100)}%</div>
                          <div className="metric-status">
                            {selectedDocument.ai_confidence > 0.9 ? 'High Confidence' : 
                             selectedDocument.ai_confidence > 0.7 ? 'Medium Confidence' : 'Low Confidence'}
                          </div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-title">Fraud Risk</div>
                          <div 
                            className="metric-value"
                            style={{ color: getFraudRiskColor(selectedDocument.ai_fraud_risk) }}
                          >
                            {Math.round(selectedDocument.ai_fraud_risk * 100)}%
                          </div>
                          <div className="metric-status">
                            {selectedDocument.ai_fraud_risk > 0.7 ? 'High Risk' : 
                             selectedDocument.ai_fraud_risk > 0.3 ? 'Medium Risk' : 'Low Risk'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Classification */}
                    {selectedDocument.ai_classification && (
                      <div className="classification-section">
                        <h5>Document Classification</h5>
                        <div className="classification-grid">
                          <div className="classification-item">
                            <span className="label">Document Type:</span>
                            <span className="value">{selectedDocument.ai_classification.document_type || 'Unknown'}</span>
                          </div>
                          <div className="classification-item">
                            <span className="label">Category:</span>
                            <span className="value">{selectedDocument.ai_classification.category || 'General'}</span>
                          </div>
                          <div className="classification-item">
                            <span className="label">Subcategory:</span>
                            <span className="value">{selectedDocument.ai_classification.subcategory || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Extracted Data */}
                    {selectedDocument.ai_extracted_data && (
                      <div className="extracted-data-section">
                        <h5>Extracted Information</h5>
                        <div className="extracted-fields-grid">
                          {Object.entries(selectedDocument.ai_extracted_data).map(([key, value]) => (
                            <div key={key} className="extracted-field">
                              <div className="field-label">{key.replace(/_/g, ' ').toUpperCase()}</div>
                              <div className="field-value">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Recommendations */}
                    {selectedDocument.ai_classification?.recommendations && (
                      <div className="recommendations-section">
                        <h5>AI Recommendations</h5>
                        <div className="recommendations-list">
                          {selectedDocument.ai_classification.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="recommendation-item">
                              <div className="recommendation-text">{rec}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

        {/* Document Images Section */}
        <div className="document-images-section">
          <h4>Document Images</h4>
          <div className="images-grid">
            {(selectedDocument as any).image_urls && (selectedDocument as any).image_urls.length > 0 ? (
              (selectedDocument as any).image_urls.map((imageUrl: string, index: number) => (
                <div key={index} className="image-container">
                  <img 
                    src={imageUrl} 
                    alt={`Document Image ${index + 1}`}
                    className="document-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <div className="image-info">
                    <span>Image {index + 1}</span>
                    <button 
                      className="view-full-btn"
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      View Full Size
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-images">
                <p>No images available for this document</p>
              </div>
            )}
          </div>
        </div>


                {selectedDocument.ai_extracted_data && (
                  <div className="extracted-data">
                    <h5>Extracted Information:</h5>
                    <div className="data-grid">
                      {Object.entries(selectedDocument.ai_extracted_data).map(([key, value]) => (
                        <div key={key} className="data-item">
                          <span className="data-label">{key}:</span>
                          <span className="data-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="processing-form">
                  <h4>Update Status</h4>
                  <div className="form-group">
                    <label>New Status:</label>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="in_review">In Review</option>
                      <option value="completed">Completed</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Processing Notes:</label>
                    <textarea 
                      value={processingNotes}
                      onChange={(e) => setProcessingNotes(e.target.value)}
                      placeholder="Add processing notes..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => setShowDocumentDetails(false)}
                >
                  Cancel
                </button>
                <button 
                  className="action-btn primary"
                  onClick={handleStatusUpdate}
                  disabled={!newStatus}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialDashboard;
