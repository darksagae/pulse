import React, { useState, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import adminIcon from '../assets/images/admin.png';
import { User } from '../lib/api';
import { enhancedAPI, EnhancedDocument, DocumentFile, AdminReviewRequest } from '../lib/enhanced-api';
import './PageStyles.css';
import './AdminPage.css';
import '../styles/glassmorphism.css';

interface EnhancedAdminPageProps {
  user: User;
}

const EnhancedAdminPage: React.FC<EnhancedAdminPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState<EnhancedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<EnhancedDocument | null>(null);
  const [documentImages, setDocumentImages] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState<AdminReviewRequest>({
    decision: 'approve',
    comments: '',
    admin_notes: '',
    compliance_verification: '',
    quality_assessment: '',
    system_verification: '',
    corrections: [],
    verification_notes: '',
    reviewed_fields: []
  });
  const [systemStats, setSystemStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [documentsData, statsData, logsData] = await Promise.all([
        enhancedAPI.getDocumentsForAdminReview(),
        enhancedAPI.getSystemOverviewStats(),
        enhancedAPI.getAuditLogs({ limit: 20 })
      ]);
      
      setDocuments(documentsData.documents);
      setSystemStats(statsData);
      setAuditLogs(logsData.audit_logs);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = async (document: EnhancedDocument) => {
    setSelectedDocument(document);
    try {
      const documentData = await enhancedAPI.getDocumentForAdminReview(document.id);
      setDocumentImages(documentData.images);
    } catch (error) {
      console.error('Error loading document details:', error);
    }
  };

  const handleFinalDecisionSubmit = async () => {
    if (!selectedDocument || !reviewForm.comments.trim()) {
      alert('Please provide final decision comments');
      return;
    }

    try {
      setLoading(true);
      const result = await enhancedAPI.submitAdminFinalDecision(selectedDocument.id, reviewForm);
      
      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, status: result.final_status as any, current_stage: result.final_status }
          : doc
      ));
      
      setSelectedDocument(null);
      setReviewForm({
        decision: 'approve',
        comments: '',
        admin_notes: '',
        compliance_verification: '',
        quality_assessment: '',
        system_verification: '',
        corrections: [],
        verification_notes: '',
        reviewed_fields: []
      });
      
      alert(`Final decision submitted successfully! Document status: ${result.final_status}`);
      
    } catch (error) {
      console.error('Error submitting final decision:', error);
      alert('Error submitting final decision. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': '#f39c12',
      'ai_processed': '#3498db',
      'official_review': '#e67e22',
      'admin_review': '#9b59b6',
      'completed': '#27ae60',
      'rejected': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: string } = {
      'pending': '⏳',
      'ai_processed': '🤖',
      'official_review': '👀',
      'admin_review': '👨‍💼',
      'completed': '✅',
      'rejected': '❌'
    };
    return icons[status] || '📄';
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={ugFlag} alt="Uganda Flag" className="flag-icon" />
            <h1>PublicPulse</h1>
          </div>
          <div className="user-section">
            <img
              src={adminIcon}
              alt="Admin"
              className="admin-icon-image"
              style={{
                width: '80px',
                height: '80px',
                border: '4px solid red',
                borderRadius: '50%',
                display: 'block'
              }}
            />
            <div className="user-info">
              <h2>Admin User</h2>
              <p>System Administrator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="tab-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <span className="tab-icon">📄</span>
            Documents
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <span className="tab-icon">⚖️</span>
            Final Reviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <span className="tab-icon">📋</span>
            Audit Logs
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>{systemStats?.system_stats?.total_documents || 0}</h3>
                  <p>Total Documents</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{systemStats?.user_stats?.total_users || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍💼</div>
                <div className="stat-info">
                  <h3>{systemStats?.system_stats?.admin_review || 0}</h3>
                  <p>Pending Admin Review</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{systemStats?.system_stats?.completed || 0}</h3>
                  <p>Completed</p>
                </div>
              </div>
            </div>

            <div className="system-overview">
              <h3>System Overview</h3>
              <div className="overview-grid">
                <div className="overview-card">
                  <h4>AI Performance</h4>
                  <p>Total Processed: {systemStats?.ai_metrics?.total_processed || 0}</p>
                  <p>Average Confidence: {Math.round((systemStats?.ai_metrics?.average_confidence || 0) * 100)}%</p>
                  <p>Processing Time: {systemStats?.ai_metrics?.average_processing_time || '0s'}</p>
                </div>
                <div className="overview-card">
                  <h4>User Statistics</h4>
                  <p>Citizens: {systemStats?.user_stats?.citizens || 0}</p>
                  <p>Officials: {systemStats?.user_stats?.officials || 0}</p>
                  <p>Admins: {systemStats?.user_stats?.admins || 0}</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <h4>{log.action.replace('_', ' ').toUpperCase()}</h4>
                      <p>{log.resource_type}: {log.resource_id}</p>
                      <span className="activity-time">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-content">
            <div className="section-header">
              <h3>All Documents</h3>
              <button className="glass-button" onClick={loadAdminData}>
                🔄 Refresh
              </button>
            </div>

            <div className="documents-grid">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="document-card"
                  onClick={() => handleDocumentSelect(doc)}
                >
                  <div className="document-header">
                    <div className="document-type">{doc.document_type}</div>
                    <div 
                      className="document-status"
                      style={{ backgroundColor: getStatusColor(doc.status) }}
                    >
                      {getStatusIcon(doc.status)} {doc.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="document-info">
                    <p><strong>Priority:</strong> {doc.priority}</p>
                    <p><strong>Submitted:</strong> {new Date(doc.created_at).toLocaleDateString()}</p>
                    {doc.ai_confidence && (
                      <p><strong>AI Confidence:</strong> {Math.round(doc.ai_confidence * 100)}%</p>
                    )}
                  </div>
                  <div className="document-actions">
                    <button className="glass-button small">
                      👁️ Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && selectedDocument && (
          <div className="review-content">
            <div className="section-header">
              <h3>Final Review: {selectedDocument.document_type}</h3>
              <button className="glass-button" onClick={() => setSelectedDocument(null)}>
                ← Back to Documents
              </button>
            </div>

            <div className="review-layout">
              <div className="document-viewer">
                <h4>Document Images</h4>
                <div className="images-grid">
                  {documentImages.map((image, index) => (
                    <div key={index} className="image-container">
                      <img 
                        src={image.signed_url || image.file_path} 
                        alt={`Document ${index + 1}`}
                        className="document-image"
                      />
                      <div className="image-info">
                        <p>{image.file_name}</p>
                        <p>{(image.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedDocument.ai_extracted_fields && (
                  <div className="ai-extraction">
                    <h4>AI Extracted Information</h4>
                    <div className="extracted-fields">
                      {Object.entries(selectedDocument.ai_extracted_fields).map(([key, value]) => (
                        <div key={key} className="field-item">
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDocument.official_review_comment && (
                  <div className="official-review">
                    <h4>Official Review</h4>
                    <p>{selectedDocument.official_review_comment}</p>
                  </div>
                )}
              </div>

              <div className="review-form">
                <h4>Final Decision</h4>
                <div className="form-group">
                  <label>Final Decision</label>
                  <select 
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, decision: e.target.value as any }))}
                    className="glass-input"
                  >
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="reassign">Reassign</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Final Comments *</label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                    className="glass-input"
                    rows={4}
                    placeholder="Provide final decision comments..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Admin Notes</label>
                  <textarea
                    value={reviewForm.admin_notes}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                    className="glass-input"
                    rows={3}
                    placeholder="Additional admin notes..."
                  />
                </div>

                <div className="form-group">
                  <label>Compliance Verification</label>
                  <textarea
                    value={reviewForm.compliance_verification}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, compliance_verification: e.target.value }))}
                    className="glass-input"
                    rows={2}
                    placeholder="Compliance verification notes..."
                  />
                </div>

                <div className="form-group">
                  <label>System Verification</label>
                  <textarea
                    value={reviewForm.system_verification}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, system_verification: e.target.value }))}
                    className="glass-input"
                    rows={2}
                    placeholder="System verification notes..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    className="glass-button primary"
                    onClick={handleFinalDecisionSubmit}
                    disabled={loading || !reviewForm.comments.trim()}
                  >
                    {loading ? '⏳ Submitting...' : '⚖️ Submit Final Decision'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="audit-content">
            <div className="section-header">
              <h3>System Audit Logs</h3>
              <button className="glass-button" onClick={loadAdminData}>
                🔄 Refresh
              </button>
            </div>

            <div className="audit-logs">
              {auditLogs.map((log) => (
                <div key={log.id} className="audit-log-item">
                  <div className="log-header">
                    <span className="log-action">{log.action.replace('_', ' ').toUpperCase()}</span>
                    <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="log-details">
                    <p><strong>Resource:</strong> {log.resource_type} - {log.resource_id}</p>
                    {log.details && (
                      <div className="log-details-json">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminPage;
