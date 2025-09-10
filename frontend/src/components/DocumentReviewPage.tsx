import React, { useState, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import officialIcon from '../assets/images/official.png';
import { official } from '../lib/api';
import { Document } from '../lib/api';
import './PageStyles.css';
import '../styles/glassmorphism.css';

const DocumentReviewPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await official.getDocuments();
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
      case 'under_review': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleDocumentClick = async (documentId: string) => {
    try {
      const document = await official.getDocumentById(documentId);
      setSelectedDocument(document);
    } catch (err) {
      console.error('Error loading document details:', err);
      setError('Failed to load document details.');
    }
  };

  const closeDocumentView = () => {
    setSelectedDocument(null);
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header glass-card-lg">
          <img 
            src={officialIcon}
            alt="Official Portal" 
            className="citizen-icon-image"
          />
          <h1 className="page-title">Document Review Portal</h1>
          <p className="page-subtitle">Review submitted citizen documents</p>
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
            {documents.length === 0 ? (
              <div className="empty-state glass-card">
                <h3>No Documents Found</h3>
                <p>No documents have been submitted yet.</p>
              </div>
            ) : (
              documents.map((doc) => (
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
                  </div>
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
                <h2>Document Review: {selectedDocument.document_type}</h2>
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
                            alt={`Document Image ${index + 1}`}
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

                {/* Action Buttons */}
                <div className="modal-actions">
                  <button className="action-btn primary">
                    Approve
                  </button>
                  <button className="action-btn secondary">
                    Request Changes
                  </button>
                  <button className="action-btn danger">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .documents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            width: 800px;
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

          .modal-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
          }

          .action-btn.danger {
            background: #dc3545;
            color: white;
          }

          .action-btn.danger:hover {
            background: #c82333;
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

export default DocumentReviewPage;
