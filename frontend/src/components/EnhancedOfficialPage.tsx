import React, { useState, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import officialIcon from '../assets/images/admin.png';
import { User } from '../lib/api';
import { enhancedAPI, EnhancedDocument, DocumentFile, OfficialReviewRequest } from '../lib/enhanced-api';
import './PageStyles.css';
import './OfficialPage.css';
import '../styles/glassmorphism.css';

interface EnhancedOfficialPageProps {
  user: User;
}

const EnhancedOfficialPage: React.FC<EnhancedOfficialPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState<EnhancedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<EnhancedDocument | null>(null);
  const [documentImages, setDocumentImages] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState<OfficialReviewRequest>({
    decision: 'approve',
    comments: '',
    verification_notes: '',
    reviewed_fields: [],
    corrections: [],
    quality_assessment: '',
    compliance_check: ''
  });
  const [stats, setStats] = useState<any>(null);

  // Load documents and stats on component mount
  useEffect(() => {
    loadOfficialData();
  }, []);

  const loadOfficialData = async () => {
    setLoading(true);
    try {
      const [documentsData, statsData] = await Promise.all([
        enhancedAPI.getDocumentsForReview(),
        enhancedAPI.getOfficialDashboardStats()
      ]);
      
      setDocuments(documentsData.documents);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading official data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = async (document: EnhancedDocument) => {
    setSelectedDocument(document);
    try {
      const documentData = await enhancedAPI.getDocumentForReview(document.id);
      setDocumentImages(documentData.images);
    } catch (error) {
      console.error('Error loading document details:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedDocument || !reviewForm.comments.trim()) {
      alert('Please provide review comments');
      return;
    }

    try {
      setLoading(true);
      const result = await enhancedAPI.submitOfficialReview(selectedDocument.id, reviewForm);
      
      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, status: result.next_status as any, current_stage: result.next_status }
          : doc
      ));
      
      setSelectedDocument(null);
      setReviewForm({
        decision: 'approve',
        comments: '',
        verification_notes: '',
        reviewed_fields: [],
        corrections: [],
        quality_assessment: '',
        compliance_check: ''
      });
      
      alert(`Review submitted successfully! Document status: ${result.next_status}`);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
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
    <div className="official-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={ugFlag} alt="Uganda Flag" className="flag-icon" />
            <h1>PublicPulse</h1>
          </div>
          <div className="user-section">
            <img
              src={officialIcon}
              alt="Official"
              className="official-icon-image"
              style={{
                width: '80px',
                height: '80px',
                border: '4px solid blue',
                borderRadius: '50%',
                display: 'block'
              }}
            />
            <div className="user-info">
              <h2>Official User</h2>
              <p>Government Official</p>
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
            <span className="tab-icon">✍️</span>
            Reviews
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>{stats?.department_stats?.total_documents || 0}</h3>
                  <p>Total Documents</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👀</div>
                <div className="stat-info">
                  <h3>{stats?.department_stats?.official_review || 0}</h3>
                  <p>Pending Review</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats?.department_stats?.completed || 0}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats?.department_stats?.completed_today || 0}</h3>
                  <p>Completed Today</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Documents</h3>
              <div className="activity-list">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="activity-item">
                    <div className="activity-icon" style={{ color: getStatusColor(doc.status) }}>
                      {getStatusIcon(doc.status)}
                    </div>
                    <div className="activity-content">
                      <h4>{doc.document_type}</h4>
                      <p>Status: {doc.status.replace('_', ' ').toUpperCase()}</p>
                      <span className="activity-time">
                        {new Date(doc.created_at).toLocaleDateString()}
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
              <h3>Documents for Review</h3>
              <button className="glass-button" onClick={loadOfficialData}>
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
              <h3>Review Document: {selectedDocument.document_type}</h3>
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
              </div>

              <div className="review-form">
                <h4>Review Form</h4>
                <div className="form-group">
                  <label>Decision</label>
                  <select 
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, decision: e.target.value as any }))}
                    className="glass-input"
                  >
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="needs_resubmission">Needs Resubmission</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments *</label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                    className="glass-input"
                    rows={4}
                    placeholder="Provide detailed review comments..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Verification Notes</label>
                  <textarea
                    value={reviewForm.verification_notes}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, verification_notes: e.target.value }))}
                    className="glass-input"
                    rows={3}
                    placeholder="Additional verification notes..."
                  />
                </div>

                <div className="form-group">
                  <label>Quality Assessment</label>
                  <textarea
                    value={reviewForm.quality_assessment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, quality_assessment: e.target.value }))}
                    className="glass-input"
                    rows={2}
                    placeholder="Document quality assessment..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    className="glass-button primary"
                    onClick={handleReviewSubmit}
                    disabled={loading || !reviewForm.comments.trim()}
                  >
                    {loading ? '⏳ Submitting...' : '✅ Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedOfficialPage;
