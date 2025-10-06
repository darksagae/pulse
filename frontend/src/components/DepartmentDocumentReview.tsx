import React, { useState, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import officialIcon from '../assets/images/official.png';
import { official } from '../lib/api';
import { Document } from '../lib/api';
import './PageStyles.css';
import '../styles/glassmorphism.css';

interface DepartmentDocumentReviewProps {
  departmentId: string;
  departmentName: string;
  onBack: () => void;
}

const DepartmentDocumentReview: React.FC<DepartmentDocumentReviewProps> = ({ 
  departmentId, 
  departmentName, 
  onBack 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'department' | 'assigned'>('department');
  const [reviewComment, setReviewComment] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{[key: string]: any}>({});
  const [aiProcessing, setAiProcessing] = useState<{[key: string]: boolean}>({});
  const [extractionProgress, setExtractionProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadDocuments();
  }, [departmentId, activeTab]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (activeTab === 'department') {
        response = await official.getDepartmentDocuments(departmentId);
      } else {
        // For now, use a mock official ID - in real app, get from auth context
        response = await official.getAssignedDocuments('official_001');
      }
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
    setReviewComment('');
  };

  const handleOfficialReview = async () => {
    if (!selectedDocument) return;

    try {
      await official.reviewDocument(selectedDocument.id, reviewComment);
      alert('Document reviewed and submitted to admin successfully!');
      closeDocumentView();
      loadDocuments(); // Refresh the list
    } catch (err) {
      console.error('Error reviewing document:', err);
      setError('Failed to review document. Please try again.');
    }
  };

  const handleAssignToMe = async (documentId: string) => {
    // In a real app, this would call an API to assign the document
    console.log(`Assigning document ${documentId} to current official`);
    // For now, just refresh the documents
    loadDocuments();
  };

  const handleExtractDocument = async (documentId: string) => {
    setAiProcessing(prev => ({ ...prev, [documentId]: true }));
    setExtractionProgress(prev => ({ ...prev, [documentId]: 0 }));
    
    try {
      // Simulate AI processing with progress updates
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          const current = prev[documentId] || 0;
          if (current >= 100) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [documentId]: Math.min(current + 10, 100) };
        });
      }, 200);

      // Call the AI extraction API
      const result = await official.extractDocument(documentId);
      
      clearInterval(progressInterval);
      setExtractionProgress(prev => ({ ...prev, [documentId]: 100 }));
      
      // Store extracted data
      setExtractedData(prev => ({ ...prev, [documentId]: result.extracted_data }));
      
      // Update the document in the list
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'ai_processed' as any, ai_extracted_fields: result.extracted_data }
          : doc
      ));
      
      alert('Document information extracted successfully!');
      
    } catch (err) {
      console.error('Error extracting document:', err);
      setError('Failed to extract document information. Please try again.');
    } finally {
      setAiProcessing(prev => ({ ...prev, [documentId]: false }));
      setTimeout(() => {
        setExtractionProgress(prev => ({ ...prev, [documentId]: 0 }));
      }, 1000);
    }
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
          <h1 className="page-title">{departmentName} Document Review</h1>
          <p className="page-subtitle">Review and process documents assigned to {departmentName}</p>
          
          <button 
            className="action-btn secondary" 
            onClick={onBack}
            style={{ marginTop: '15px' }}
          >
            ← Back to Departments
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="document-tabs glass-card">
          <button 
            className={`tab-btn glass-button ${activeTab === 'department' ? 'active' : ''}`}
            onClick={() => setActiveTab('department')}
          >
            Department Documents ({documents.length})
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            My Assigned Documents
          </button>
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
                <p>
                  {activeTab === 'department' 
                    ? `No documents have been assigned to ${departmentName} yet.`
                    : 'No documents have been assigned to you yet.'
                  }
                </p>
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
                    {doc.assigned_official_id && (
                      <p><strong>Assigned to:</strong> {doc.assigned_official_id}</p>
                    )}
                  </div>
                  {doc.description && (
                    <div className="document-description">
                      <p><strong>Description:</strong> {doc.description}</p>
                    </div>
                  )}
                  
                  <div className="document-actions">
                    {activeTab === 'department' && !doc.assigned_official_id && (
                      <button 
                        className="action-btn primary small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignToMe(doc.id);
                        }}
                      >
                        Assign to Me
                      </button>
                    )}
                    
                    {doc.assigned_official_id && doc.status === 'submitted' && (
                      <button 
                        className="action-btn success small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExtractDocument(doc.id);
                        }}
                        disabled={aiProcessing[doc.id]}
                      >
                        {aiProcessing[doc.id] ? (
                          <div className="extraction-progress">
                            <span>🤖 Extracting... {extractionProgress[doc.id] || 0}%</span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${extractionProgress[doc.id] || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          'Extract Information'
                        )}
                      </button>
                    )}
                    
                    {doc.status === 'ai_processed' && (
                      <div className="ai-processed-badge">
                        <span className="ai-badge">✅ AI Processed</span>
                        <span className="extracted-info">
                          {extractedData[doc.id] ? 'Information extracted' : 'Ready for review'}
                        </span>
                      </div>
                    )}
                  </div>
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

                {/* AI Extracted Information */}
                {(selectedDocument.status === 'ai_processed' || extractedData[selectedDocument.id]) && (
                  <div className="ai-extracted-info">
                    <h3>🤖 AI Extracted Information</h3>
                    <div className="extracted-fields">
                      {extractedData[selectedDocument.id] ? (
                        Object.entries(extractedData[selectedDocument.id]).map(([key, value]) => (
                          <div key={key} className="field-item">
                            <span className="field-label">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                            <span className="field-value">{value as string}</span>
                          </div>
                        ))
                      ) : (
                        <div className="ai-processing-placeholder">
                          <div className="processing-animation">
                            <div className="spinner"></div>
                            <span>AI is analyzing the document...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Official Review Form */}
                {(selectedDocument.status === 'submitted' || selectedDocument.status === 'ai_processed') && (
                  <div className="official-review-form">
                    <h3>Official Review</h3>
                    <div className="form-group">
                      <label htmlFor="review-comment">Review Comment:</label>
                      <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Enter your review comment based on the AI analysis..."
                        className="form-textarea"
                        rows={4}
                      />
                    </div>
                    {selectedDocument.status === 'ai_processed' && (
                      <div className="ai-review-note">
                        <p><strong>💡 AI Analysis Complete:</strong> Review the extracted information above and add your official comment before submitting to admin.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="modal-actions">
                  {selectedDocument.status === 'submitted' && !selectedDocument.assigned_official_id ? (
                    <button 
                      className="action-btn success"
                      onClick={() => handleAssignToMe(selectedDocument.id)}
                    >
                      Assign to Me
                    </button>
                  ) : selectedDocument.status === 'submitted' && selectedDocument.assigned_official_id ? (
                    <button 
                      className="action-btn primary"
                      onClick={() => handleExtractDocument(selectedDocument.id)}
                      disabled={aiProcessing[selectedDocument.id]}
                    >
                      {aiProcessing[selectedDocument.id] ? (
                        <div className="extraction-progress">
                          <span>🤖 Extracting... {extractionProgress[selectedDocument.id] || 0}%</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${extractionProgress[selectedDocument.id] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        'Extract Information'
                      )}
                    </button>
                  ) : selectedDocument.status === 'ai_processed' ? (
                    <button 
                      className="action-btn primary"
                      onClick={handleOfficialReview}
                      disabled={!reviewComment.trim()}
                    >
                      Submit to Admin with AI Results
                    </button>
                  ) : (
                    <button className="action-btn primary">
                      View Details
                    </button>
                  )}
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
          .document-tabs {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            padding: 15px;
          }

          .tab-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            color: #333;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .tab-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .tab-btn:hover {
            transform: translateY(-2px);
          }

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

          .document-actions {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }

          .action-btn.small {
            padding: 8px 16px;
            font-size: 0.9em;
          }

          .action-btn.success {
            background: #28a745;
            color: white;
          }

          .action-btn.success:hover {
            background: #218838;
          }

          .official-review-form {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
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

          .action-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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

          .extraction-progress {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            min-width: 200px;
          }

          .progress-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
            border-radius: 3px;
          }

          .ai-processed-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            margin-top: 10px;
          }

          .ai-badge {
            background: #4CAF50;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
          }

          .extracted-info {
            font-size: 0.8em;
            color: #666;
          }

          .ai-extracted-info {
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 10px;
            border: 1px solid #bbdefb;
          }

          .ai-extracted-info h3 {
            margin-bottom: 15px;
            color: #1976d2;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .extracted-fields {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
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

          .ai-processing-placeholder {
            text-align: center;
            padding: 40px;
          }

          .processing-animation {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .ai-review-note {
            margin-top: 15px;
            padding: 15px;
            background: #e8f5e8;
            border: 1px solid #c8e6c9;
            border-radius: 8px;
            color: #2e7d32;
          }

          .ai-review-note p {
            margin: 0;
            font-size: 0.9em;
          }
        `
      }} />
    </div>
  );
};

export default DepartmentDocumentReview;
