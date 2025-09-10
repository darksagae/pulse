import React, { useState, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import adminIcon from '../assets/images/admin.png';
import { admin } from '../lib/api';
import { Document } from '../lib/api';
import './PageStyles.css';
import '../styles/glassmorphism.css';

const AdminDocumentReview: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await admin.getDocuments();
      setDocuments(response.documents || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#2196F3';
      case 'ai_processed': return '#3B82F6';
      case 'Under Review': return '#8b5cf6';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'ai_processed': return 'AI Processed';
      case 'Under Review': return 'Under Review';
      case 'Approved': return 'Approved';
      case 'Rejected': return 'Rejected';
      default: return status;
    }
  };

  const getPriorityColor = (confidence: number, fraudRisk: number) => {
    if (fraudRisk > 0.7) return '#ef4444'; // High fraud risk
    if (confidence < 0.6) return '#f59e0b'; // Low confidence
    if (fraudRisk > 0.4) return '#f97316'; // Medium fraud risk
    return '#10b981'; // Good
  };

  const handleDocumentClick = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (document) {
        setSelectedDocument(document);
      }
    } catch (err) {
      console.error('Error loading document details:', err);
      setError('Failed to load document details.');
    }
  };

  const closeDocumentView = () => {
    setSelectedDocument(null);
    setReviewComment('');
  };

  const handleAdminReview = async (action: 'approve' | 'reject' | 'reassign') => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
      await admin.reviewDocument(selectedDocument.id, action, reviewComment);
      alert(`Document ${action}d successfully!`);
      closeDocumentView();
      loadDocuments(); // Refresh the list
    } catch (err) {
      console.error('Error reviewing document:', err);
      setError(`Failed to ${action} document. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterStatus === 'all') return true;
    return doc.status === filterStatus;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'confidence':
        return (b.ai_confidence || 0) - (a.ai_confidence || 0);
      case 'fraud_risk':
        return (b.ai_fraud_risk || 0) - (a.ai_fraud_risk || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header glass-card-lg">
          <img 
            src={adminIcon}
            alt="Admin Portal" 
            className="citizen-icon-image"
          />
          <h1 className="page-title">Admin Document Review</h1>
          <p className="page-subtitle">Review documents with AI assessment and official comments</p>
        </div>

        {/* Filters and Controls */}
        <div className="admin-controls glass-card">
          <div className="control-group">
            <label>Filter by Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Documents</option>
              <option value="ai_processed">AI Processed</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="control-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="created_at">Submission Date</option>
              <option value="confidence">AI Confidence</option>
              <option value="fraud_risk">Fraud Risk</option>
            </select>
          </div>
          <div className="control-group">
            <button 
              className="action-btn secondary"
              onClick={loadDocuments}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message glass-card" style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            padding: '15px',
            margin: '20px 0',
            borderRadius: '8px'
          }}>
            <p>{error}</p>
            <button 
              className="action-btn secondary" 
              onClick={loadDocuments}
              style={{ marginTop: '10px' }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state glass-card">
            <p>Loading documents...</p>
          </div>
        ) : (
          <div className="documents-grid">
            {sortedDocuments.length === 0 ? (
              <div className="empty-state glass-card">
                <h3>No Documents Found</h3>
                <p>No documents match the current filter criteria.</p>
              </div>
            ) : (
              sortedDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="document-card glass-card clickable"
                  onClick={() => handleDocumentClick(doc.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="document-header">
                    <h4>{doc.document_type || 'Document'}</h4>
                    <div className="status-container">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(doc.status) }}
                      >
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="document-info">
                    <p><strong>Citizen ID:</strong> {doc.citizen_id}</p>
                    <p><strong>Department:</strong> {doc.department_id?.toUpperCase() || 'NIRA'}</p>
                    <p><strong>Submitted:</strong> {new Date(doc.created_at || '').toLocaleDateString()}</p>
                    <p><strong>Images:</strong> {doc.images?.length || 0} image(s)</p>
                    {doc.assigned_official_id && (
                      <p><strong>Official:</strong> {doc.assigned_official_id}</p>
                    )}
                  </div>

                  {/* AI Assessment Summary */}
                  {doc.ai_confidence && (
                    <div className="ai-assessment-summary">
                      <div className="ai-metric">
                        <span className="metric-label">AI Confidence:</span>
                        <span className="metric-value">
                          {Math.round(doc.ai_confidence * 100)}%
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
                  )}

                  {doc.description && (
                    <div className="document-description">
                      <p><strong>Description:</strong> {doc.description}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div className="document-modal-overlay" onClick={closeDocumentView}>
            <div className="document-modal glass-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Admin Review: {selectedDocument.document_type}</h2>
                <button className="close-btn" onClick={closeDocumentView}>×</button>
              </div>
              
              <div className="modal-content">
                <div className="document-details">
                  <div className="detail-row">
                    <strong>Document ID:</strong> {selectedDocument.id}
                  </div>
                  <div className="detail-row">
                    <strong>Citizen ID:</strong> {selectedDocument.citizen_id}
                  </div>
                  <div className="detail-row">
                    <strong>Department:</strong> {selectedDocument.department_id?.toUpperCase() || 'NIRA'}
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong> 
                    <span 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(selectedDocument.status),
                        marginLeft: '10px'
                      }}
                    >
                      {getStatusText(selectedDocument.status)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Submitted:</strong> {new Date(selectedDocument.created_at || '').toLocaleString()}
                  </div>
                  {selectedDocument.assigned_official_id && (
                    <div className="detail-row">
                      <strong>Assigned Official:</strong> {selectedDocument.assigned_official_id}
                    </div>
                  )}
                  {selectedDocument.description && (
                    <div className="detail-row">
                      <strong>Description:</strong> {selectedDocument.description}
                    </div>
                  )}
                </div>

                {/* Document Images */}
                {selectedDocument.images && selectedDocument.images.length > 0 && (
                  <div className="document-images-section">
                    <h3>Document Images ({selectedDocument.images.length})</h3>
                    <div className="images-grid">
                      {selectedDocument.images.map((image, index) => (
                        <div key={index} className="image-container">
                          <img 
                            src={image} 
                            alt={`Document ${index + 1}`}
                            className="document-image"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '400px',
                              objectFit: 'contain',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              backgroundColor: '#f9f9f9'
                            }}
                          />
                          <p className="image-label">Image {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis Results */}
                {(selectedDocument.ai_confidence || selectedDocument.ai_extracted_fields) && (
                  <div className="ai-analysis-results">
                    <h3>🤖 AI Analysis Results</h3>
                    
                    <div className="ai-metrics-grid">
                      <div className="ai-metric-card">
                        <h4>Confidence Score</h4>
                        <div className="metric-value-large">
                          {Math.round((selectedDocument.ai_confidence || 0) * 100)}%
                        </div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill" 
                            style={{ 
                              width: `${(selectedDocument.ai_confidence || 0) * 100}%`,
                              backgroundColor: selectedDocument.ai_confidence && selectedDocument.ai_confidence > 0.8 ? '#10b981' : 
                                            selectedDocument.ai_confidence && selectedDocument.ai_confidence > 0.6 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="ai-metric-card">
                        <h4>Quality Score</h4>
                        <div className="metric-value-large">
                          {Math.round((selectedDocument.ai_quality_score || 0) * 100)}%
                        </div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill" 
                            style={{ 
                              width: `${(selectedDocument.ai_quality_score || 0) * 100}%`,
                              backgroundColor: selectedDocument.ai_quality_score && selectedDocument.ai_quality_score > 0.8 ? '#10b981' : 
                                            selectedDocument.ai_quality_score && selectedDocument.ai_quality_score > 0.6 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="ai-metric-card">
                        <h4>Fraud Risk</h4>
                        <div className="metric-value-large">
                          {Math.round((selectedDocument.ai_fraud_risk || 0) * 100)}%
                        </div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill" 
                            style={{ 
                              width: `${(selectedDocument.ai_fraud_risk || 0) * 100}%`,
                              backgroundColor: selectedDocument.ai_fraud_risk && selectedDocument.ai_fraud_risk > 0.7 ? '#ef4444' : 
                                            selectedDocument.ai_fraud_risk && selectedDocument.ai_fraud_risk > 0.4 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {selectedDocument.ai_extracted_fields && (
                      <div className="extracted-fields-section">
                        <h4>Extracted Information</h4>
                        <div className="extracted-fields">
                          {Object.entries(selectedDocument.ai_extracted_fields).map(([key, value]) => (
                            <div key={key} className="field-item">
                              <span className="field-label">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                              <span className="field-value">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDocument.ai_recommendations && selectedDocument.ai_recommendations.length > 0 && (
                      <div className="ai-recommendations">
                        <h4>AI Recommendations</h4>
                        <ul>
                          {selectedDocument.ai_recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedDocument.ai_issues && selectedDocument.ai_issues.length > 0 && (
                      <div className="ai-issues">
                        <h4>Issues Found</h4>
                        <ul>
                          {selectedDocument.ai_issues.map((issue, index) => (
                            <li key={index} className="issue-item">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Official Review Comments */}
                {selectedDocument.official_review_comment && (
                  <div className="official-review-section">
                    <h3>👤 Official Review</h3>
                    <div className="official-comment">
                      <p><strong>Official Comment:</strong></p>
                      <p>{selectedDocument.official_review_comment}</p>
                      {selectedDocument.official_reviewed_at && (
                        <p><strong>Reviewed at:</strong> {new Date(selectedDocument.official_reviewed_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Review Form */}
                <div className="admin-review-form">
                  <h3>Admin Review</h3>
                  <div className="form-group">
                    <label htmlFor="admin-review-comment">Review Comment:</label>
                    <textarea
                      id="admin-review-comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Enter your admin review comment..."
                      className="form-textarea"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                  <button 
                    className="action-btn success"
                    onClick={() => handleAdminReview('approve')}
                    disabled={loading || !reviewComment.trim()}
                  >
                    Approve Document
                  </button>
                  <button 
                    className="action-btn warning"
                    onClick={() => handleAdminReview('reassign')}
                    disabled={loading || !reviewComment.trim()}
                  >
                    Reassign to Department
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={() => handleAdminReview('reject')}
                    disabled={loading || !reviewComment.trim()}
                  >
                    Reject Document
                  </button>
                  <button className="action-btn secondary" onClick={closeDocumentView}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .admin-controls {
            display: flex;
            gap: 20px;
            align-items: center;
            margin: 20px 0;
            padding: 20px;
            flex-wrap: wrap;
          }

          .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .control-group label {
            font-weight: bold;
            color: #333;
            font-size: 0.9em;
          }

          .filter-select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            font-size: 0.9em;
          }

          .documents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .document-card {
            padding: 20px;
            transition: transform 0.2s ease;
          }

          .document-card:hover {
            transform: translateY(-2px);
          }

          .document-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            color: white;
            font-size: 0.8em;
            font-weight: bold;
          }

          .document-info p {
            margin: 5px 0;
            font-size: 0.9em;
          }

          .ai-assessment-summary {
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }

          .ai-metric {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 0.9em;
          }

          .metric-label {
            color: #666;
          }

          .metric-value {
            font-weight: bold;
            color: #333;
          }

          .priority-indicator {
            margin-top: 10px;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 0.8em;
            font-weight: bold;
            text-align: center;
          }

          .document-description {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
          }

          .document-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .document-modal {
            max-width: 95vw;
            max-height: 95vh;
            overflow-y: auto;
            width: 1000px;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #eee;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          }

          .close-btn:hover {
            color: #000;
          }

          .document-details {
            margin-bottom: 30px;
          }

          .detail-row {
            margin: 10px 0;
            display: flex;
            align-items: center;
          }

          .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .image-container {
            text-align: center;
          }

          .image-label {
            margin-top: 10px;
            font-size: 0.9em;
            color: #666;
          }

          .ai-analysis-results {
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 10px;
            border: 1px solid #bbdefb;
          }

          .ai-analysis-results h3 {
            margin-bottom: 20px;
            color: #1976d2;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ai-metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .ai-metric-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            text-align: center;
          }

          .ai-metric-card h4 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 0.9em;
          }

          .metric-value-large {
            font-size: 2em;
            font-weight: bold;
            color: #1976d2;
            margin: 10px 0;
          }

          .metric-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
          }

          .metric-fill {
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 4px;
          }

          .extracted-fields-section {
            margin: 20px 0;
          }

          .extracted-fields {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 15px 0;
          }

          .field-item {
            display: flex;
            flex-direction: column;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }

          .field-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            font-size: 0.9em;
          }

          .field-value {
            color: #555;
            font-size: 0.95em;
            word-break: break-word;
          }

          .ai-recommendations, .ai-issues {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }

          .ai-recommendations h4 {
            color: #10b981;
            margin-bottom: 10px;
          }

          .ai-issues h4 {
            color: #ef4444;
            margin-bottom: 10px;
          }

          .ai-recommendations ul, .ai-issues ul {
            margin: 0;
            padding-left: 20px;
          }

          .ai-recommendations li, .ai-issues li {
            margin: 5px 0;
            font-size: 0.9em;
          }

          .issue-item {
            color: #ef4444;
          }

          .official-review-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }

          .official-review-section h3 {
            margin-bottom: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .official-comment {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }

          .official-comment p {
            margin: 5px 0;
          }

          .admin-review-form {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }

          .admin-review-form h3 {
            margin-bottom: 15px;
            color: #333;
          }

          .form-group {
            margin: 15px 0;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }

          .form-textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            resize: vertical;
            min-height: 100px;
          }

          .modal-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            flex-wrap: wrap;
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

          .action-btn.success {
            background: #10b981;
            color: white;
          }

          .action-btn.success:hover {
            background: #059669;
          }

          .action-btn.warning {
            background: #f59e0b;
            color: white;
          }

          .action-btn.warning:hover {
            background: #d97706;
          }

          .action-btn.danger {
            background: #ef4444;
            color: white;
          }

          .action-btn.danger:hover {
            background: #dc2626;
          }

          .action-btn.secondary {
            background: #6b7280;
            color: white;
          }

          .action-btn.secondary:hover {
            background: #4b5563;
          }

          .action-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading-state, .empty-state {
            text-align: center;
            padding: 40px;
          }

          .error-message {
            text-align: center;
          }
        `
      }} />
    </div>
  );
};

export default AdminDocumentReview;