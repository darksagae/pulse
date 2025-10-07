import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ugFlag from '../assets/images/ug.png';
import officialImg from '../assets/images/admin.png';
import { ExtractedData } from '../lib/gemini-ai-service';
import './PageStyles.css';

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
  aiExtractedData?: ExtractedData[];
  aiProcessingTime?: number;
}

const DocumentReviewPage: React.FC = () => {
  const { cardNumber } = useParams<{ cardNumber: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<RoutedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const decodedCardNumber = decodeURIComponent(cardNumber || '');
    console.log('DocumentReviewPage loaded with cardNumber:', cardNumber);
    console.log('Decoded cardNumber:', decodedCardNumber);
    loadDocument();
  }, [cardNumber]);

  const loadDocument = () => {
    try {
      setLoading(true);
      const decodedCardNumber = decodeURIComponent(cardNumber || '');
      console.log('🔍 LOADING DOCUMENT:');
      console.log('  - URL cardNumber:', cardNumber);
      console.log('  - Decoded cardNumber:', decodedCardNumber);
      
      const departmentSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
      console.log('  - Departments in storage:', Object.keys(departmentSubmissions));
      console.log('  - Total departments:', Object.keys(departmentSubmissions).length);
      
      // Find the document with the matching card number
      let foundDocument: RoutedDocument | null = null;
      let searchCount = 0;
      
      for (const department in departmentSubmissions) {
        const docs = departmentSubmissions[department];
        console.log(`  - Searching ${department}: ${docs.length} documents`);
        
        for (const doc of docs) {
          searchCount++;
          const storedCardNumber = doc.cardNumber;
          const isMatch = storedCardNumber === decodedCardNumber;
          console.log(`    - Checking doc ${searchCount}: Stored='${storedCardNumber}', Searched='${decodedCardNumber}', Match=${isMatch}`);
          if (isMatch) {
            console.log('    ✅ MATCH FOUND!');
            foundDocument = doc;
            break;
          }
        }
        
        if (foundDocument) break;
      }
      
      console.log('  - Searched', searchCount, 'documents');
      console.log('  - Found:', !!foundDocument);
      
      if (foundDocument) {
        console.log('✅ Document loaded successfully');
        console.log('  - Has AI data:', !!foundDocument.aiExtractedData);
        console.log('  - Images:', foundDocument.images.length);
      } else {
        console.error('❌ Document NOT FOUND!');
        console.error('  - Looking for card number:', decodedCardNumber);
        const allCardNumbers = Object.values(departmentSubmissions).flat().map((d: any) => d.cardNumber);
        console.error('  - Available card numbers in localStorage:', allCardNumbers);
      }
      
      setDocument(foundDocument);
    } catch (error) {
      console.error('💥 Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = (newStatus: string) => {
    if (!document) return;

    try {
      const departmentSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
      const departmentDocs = departmentSubmissions[document.department] || [];
      const updatedDocs = departmentDocs.map((doc: RoutedDocument) => 
        doc.cardNumber === cardNumber ? { ...doc, status: newStatus } : doc
      );
      
      departmentSubmissions[document.department] = updatedDocs;
      localStorage.setItem('departmentSubmissions', JSON.stringify(departmentSubmissions));
      
      // Send approval result to admin portal
      sendApprovalToAdmin(document, newStatus);
      
      setDocument(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  // Send approval result to admin portal
  const sendApprovalToAdmin = (document: RoutedDocument, status: string) => {
    try {
      const approvalData = {
        id: `approval_${Date.now()}`,
        cardNumber: document.cardNumber,
        documentType: document.documentType,
        department: document.department,
        citizenId: document.citizenId,
        status: status,
        timestamp: new Date().toISOString(),
        officialAction: status,
        images: document.images,
        feedback: generateApprovalFeedback(document, status)
      };

      // Store in admin notifications
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      adminNotifications.push(approvalData);
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));

      // Store in department-specific admin data
      const departmentAdminData = JSON.parse(localStorage.getItem('departmentAdminData') || '{}');
      if (!departmentAdminData[document.department]) {
        departmentAdminData[document.department] = [];
      }
      departmentAdminData[document.department].push(approvalData);
      localStorage.setItem('departmentAdminData', JSON.stringify(departmentAdminData));

      console.log('Approval sent to admin portal:', approvalData);
    } catch (error) {
      console.error('Error sending approval to admin:', error);
    }
  };

  // Generate logical feedback based on approval decision
  const generateApprovalFeedback = (document: RoutedDocument, status: string) => {
    const feedback = {
        approved: {
          message: `Document ${document.documentType.replace('_', ' ')} has been approved by ${document.department.toUpperCase()} department`,
          action: 'Document processing completed successfully',
          nextSteps: 'Citizen can proceed with their application',
          priority: 'low'
        },
        rejected: {
          message: `Document ${document.documentType.replace('_', ' ')} has been rejected by ${document.department.toUpperCase()} department`,
          action: 'Document requires revision or additional information',
          nextSteps: 'Citizen needs to resubmit with corrections',
          priority: 'high'
        },
        under_review: {
          message: `Document ${document.documentType.replace('_', ' ')} is under review by ${document.department.toUpperCase()} department`,
          action: 'Document is being processed by officials',
          nextSteps: 'Awaiting final decision from department',
          priority: 'medium'
        }
      };

    return feedback[status as keyof typeof feedback] || feedback.under_review;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#3b82f6';
      case 'under_review': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 80) return 'high-confidence';
    if (confidence >= 60) return 'medium-confidence';
    return 'low-confidence';
  };

  const nextImage = () => {
    if (document && currentImageIndex < document.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
        <div className="page-content">
          <div className="error-container" style={{
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            maxWidth: '600px',
            margin: '100px auto'
          }}>
            <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>📄 Document Not Found</h2>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              The document with card number <strong>"{cardNumber}"</strong> could not be found.
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Check the browser console (F12) for detailed search information.
            </p>
            <div style={{ marginTop: '20px' }}>
              <button 
                className="action-btn primary"
                onClick={() => navigate(-1)}
                style={{
                  padding: '12px 24px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <img src={officialImg} alt="Official" className="official-icon-image" />
            <div className="header-text">
              <h1 className="page-title">Document Review</h1>
              <p className="page-subtitle">Card Number: {document.cardNumber}</p>
            </div>
          </div>
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back to Department
          </button>
        </div>

        {/* Document Review Container */}
        <div className="document-review-container">
              
              {/* AI Extracted Data */}
              {document.aiExtractedData && document.aiExtractedData.length > 0 && (
                <div className="ai-extracted-data-card">
                  <h3 style={{ fontWeight: '900', fontSize: '1rem', marginBottom: '0.5rem' }}>🤖 AI EXTRACTED INFORMATION</h3>
                  <div className="ai-processing-info">
                    <span className="ai-processing-time">
                      Processing Time: {document.aiProcessingTime ? `${document.aiProcessingTime}ms` : 'N/A'}
                    </span>
                    <span className="ai-confidence">
                      Overall Confidence: {document.aiExtractedData[0]?.confidence.overall || 0}%
                    </span>
                  </div>
                  
                  {document.aiExtractedData.map((extractedData, index) => (
                    <div key={index} className="extracted-data-section">
                      <h4 style={{ fontWeight: '800', fontSize: '0.75rem', marginBottom: '0.25rem' }}>DOCUMENT {index + 1} - AI ANALYSIS</h4>
                      
                      <div className="extracted-fields">
                        <div className="field-group">
                          <h5 style={{ fontWeight: '800', fontSize: '0.75rem' }}>PERSONAL INFORMATION</h5>
                          <div className="field-grid">
                            <div className="field-item">
                              <label>Full Name:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.fullName)}`}>
                                {extractedData.personalInfo.fullName}
                                <span className="confidence-badge">{extractedData.confidence.fields.fullName}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>ID Number:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.idNumber)}`}>
                                {extractedData.personalInfo.idNumber}
                                <span className="confidence-badge">{extractedData.confidence.fields.idNumber}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>Date of Birth:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.dateOfBirth)}`}>
                                {extractedData.personalInfo.dateOfBirth}
                                <span className="confidence-badge">{extractedData.confidence.fields.dateOfBirth}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>Gender:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.gender)}`}>
                                {extractedData.personalInfo.gender}
                                <span className="confidence-badge">{extractedData.confidence.fields.gender}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>Village:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.village)}`}>
                                {extractedData.personalInfo.address.village}
                                <span className="confidence-badge">{extractedData.confidence.fields.village}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>Parish:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.parish)}`}>
                                {extractedData.personalInfo.address.parish}
                                <span className="confidence-badge">{extractedData.confidence.fields.parish}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>Sub-County:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.subCounty)}`}>
                                {extractedData.personalInfo.address.subCounty}
                                <span className="confidence-badge">{extractedData.confidence.fields.subCounty}%</span>
                              </span>
                            </div>
                            <div className="field-item">
                              <label>County:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.county)}`}>
                                {extractedData.personalInfo.address.county}
                                <span className="confidence-badge">{extractedData.confidence.fields.county}%</span>
                              </span>
              </div>
                            <div className="field-item">
                              <label>District:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.district)}`}>
                                {extractedData.personalInfo.address.district}
                                <span className="confidence-badge">{extractedData.confidence.fields.district}%</span>
                      </span>
                    </div>
                  </div>
                        </div>

                        <div className="field-group">
                          <h5 style={{ fontWeight: '800', fontSize: '0.75rem' }}>DOCUMENT INFORMATION</h5>
                          <div className="field-grid">
                            <div className="field-item">
                              <label>Document Type:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.documentType)}`}>
                                {extractedData.documentInfo.documentType}
                                <span className="confidence-badge">{extractedData.confidence.fields.documentType}%</span>
                              </span>
                  </div>
                            <div className="field-item">
                              <label>Expiry Date:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.expiryDate)}`}>
                                {extractedData.documentInfo.expiryDate}
                                <span className="confidence-badge">{extractedData.confidence.fields.expiryDate}%</span>
                              </span>
                    </div>
                            <div className="field-item">
                              <label>Issuing Authority:</label>
                              <span className={`field-value ${getConfidenceClass(extractedData.confidence.fields.issuingAuthority)}`}>
                                {extractedData.documentInfo.issuingAuthority}
                                <span className="confidence-badge">{extractedData.confidence.fields.issuingAuthority}%</span>
                              </span>
                </div>
          </div>
              </div>
              
                        {extractedData.aiRecommendations && extractedData.aiRecommendations.length > 0 && (
                          <div className="ai-recommendations">
                            <h5 style={{ fontWeight: '800', fontSize: '0.625rem' }}>AI RECOMMENDATIONS</h5>
                            <ul>
                              {extractedData.aiRecommendations.map((recommendation, recIndex) => (
                                <li key={recIndex}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                  </div>
                  </div>
                  ))}
                  </div>
              )}
              
          {/* Document Images */}
          <div className="document-images-card">
            <h3>Document Images</h3>
            {document.images.length > 0 ? (
              <div className="image-viewer">
                <div className="image-container">
                  <img 
                    src={document.images[currentImageIndex]} 
                    alt={`Document ${currentImageIndex + 1}`}
                    className="main-image"
                  />
                  {document.images.length > 1 && (
                    <div className="image-navigation">
                      <button 
                        className="nav-btn"
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                      >
                        ← Previous
                      </button>
                      <span className="image-counter">
                        {currentImageIndex + 1} of {document.images.length}
                    </span>
                      <button 
                        className="nav-btn"
                        onClick={nextImage}
                        disabled={currentImageIndex === document.images.length - 1}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>

                {document.images.length > 1 && (
                  <div className="image-thumbnails">
                    {document.images.map((image, index) => (
                      <img
                        key={index}
                            src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="no-images">No images available</p>
            )}
          </div>

                {/* Action Buttons */}
          <div className="action-buttons-card">
            <h3>Document Actions</h3>
            <div className="action-buttons">
              <button 
                className="action-btn approve"
                onClick={() => updateDocumentStatus('approved')}
                disabled={document.status === 'approved'}
              >
                ✅ Approve Document
                  </button>
              <button 
                className="action-btn review"
                onClick={() => updateDocumentStatus('under_review')}
                disabled={document.status === 'under_review'}
              >
                🔍 Mark as Under Review
                  </button>
              <button 
                className="action-btn reject"
                onClick={() => updateDocumentStatus('rejected')}
                disabled={document.status === 'rejected'}
              >
                ❌ Reject Document
                  </button>
            </div>
          </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
            .loading-container, .error-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              text-align: center;
            }

            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 1rem;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .document-review-container {
              display: flex;
              flex-direction: column;
              gap: 2rem;
              margin-top: 2rem;
            }

            .ai-extracted-data-card, .document-images-card, .action-buttons-card {
              background: var(--glass-bg-light);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              padding: 0.75rem;
              margin-bottom: 1rem;
            }

            .ai-extracted-data-card {
              padding: 0.5rem;
            }

            .extracted-data-section {
              margin-bottom: 0.5rem;
              padding: 0.5rem;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 6px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .field-group {
              margin-bottom: 0.5rem;
            }

            .field-group h5 {
              font-size: 0.75rem;
              font-weight: 800;
              color: #1f2937;
              margin-bottom: 0.25rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .field-grid {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }

            .field-item {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;
              padding: 0.25rem 0.5rem;
              background: rgba(255, 255, 255, 0.03);
              border-radius: 4px;
              border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .field-item label {
              font-size: 0.75rem;
              font-weight: 800;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              min-width: 120px;
              flex-shrink: 0;
            }

            .field-value {
              font-size: 0.875rem;
              color: #1f2937;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 0.25rem;
              flex: 1;
            }

            .confidence-badge {
              font-size: 0.625rem;
              padding: 0.125rem 0.25rem;
              border-radius: 4px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              background: rgba(59, 130, 246, 0.1);
              color: #1f2937;
            }

            .high-confidence {
              color: #1f2937;
              font-weight: 800;
            }

            .medium-confidence {
              color: #1f2937;
              font-weight: 800;
            }

            .low-confidence {
              color: #1f2937;
              font-weight: 800;
            }

            .ai-processing-info {
              display: flex;
              gap: 0.5rem;
              margin-bottom: 0.5rem;
              padding: 0.25rem;
              background: rgba(59, 130, 246, 0.1);
              border-radius: 4px;
              font-size: 0.625rem;
              font-weight: 700;
              color: #1f2937;
            }

            .ai-recommendations {
              margin-top: 0.5rem;
              padding: 0.25rem;
              background: rgba(16, 185, 129, 0.1);
              border-radius: 4px;
              border-left: 2px solid #10b981;
            }

            .ai-recommendations h5 {
              font-size: 0.625rem;
              font-weight: 800;
              color: #059669;
              margin-bottom: 0.25rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .ai-recommendations ul {
              margin: 0;
              padding-left: 0.75rem;
            }

            .ai-recommendations li {
              font-size: 0.625rem;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 0.125rem;
            }

            .info-grid {
            display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1rem;
              margin-top: 1rem;
            }

            .info-item {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }

            .info-item label {
              font-weight: 600;
              color: #374151;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .info-item span {
              color: #1f2937;
              font-size: 1rem;
            }

            .card-number-display {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              font-weight: 700;
              font-family: 'Courier New', monospace;
              letter-spacing: 1px;
              text-align: center;
          }

          .status-badge {
              display: inline-block;
              padding: 0.25rem 0.75rem;
            border-radius: 20px;
            color: white;
              font-weight: 600;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .image-viewer {
              margin-top: 1rem;
            }

            .image-container {
              position: relative;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: 1rem;
              margin-bottom: 1rem;
            }

            .main-image {
              width: 100%;
              max-width: 600px;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }

            .image-navigation {
            display: flex;
            align-items: center;
            justify-content: center;
              gap: 1rem;
              margin-top: 1rem;
            }

            .nav-btn {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              border: none;
              border-radius: 8px;
              padding: 0.5rem 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .nav-btn:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
            }

            .nav-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .image-counter {
              color: #374151;
              font-weight: 600;
              font-size: 0.875rem;
            }

            .image-thumbnails {
            display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;
              justify-content: center;
            }

            .thumbnail {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
            cursor: pointer;
              border: 2px solid transparent;
              transition: all 0.3s ease;
            }

            .thumbnail:hover {
              border-color: #3b82f6;
              transform: scale(1.05);
            }

            .thumbnail.active {
              border-color: #3b82f6;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
            }

            .no-images {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 2rem;
            }

            .action-buttons {
            display: flex;
              gap: 1rem;
              flex-wrap: wrap;
              margin-top: 1rem;
            }

            .action-btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 0.875rem;
            }

            .action-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .action-btn.approve {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
            }

            .action-btn.approve:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
            }

            .action-btn.review {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
            }

            .action-btn.review:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
            }

            .action-btn.reject {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
          }

            .action-btn.reject:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
            }

            .back-btn {
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
            }

            .back-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
            }

            @media (max-width: 768px) {
              .field-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.125rem;
                padding: 0.25rem;
              }

              .field-item label {
                min-width: auto;
                font-size: 0.625rem;
              }

              .field-value {
                font-size: 0.75rem;
              }

              .ai-processing-info {
                flex-direction: column;
                gap: 0.25rem;
                padding: 0.125rem;
              }

              .action-buttons {
                flex-direction: column;
              }

              .action-btn {
                width: 100%;
              }

              .image-thumbnails {
                justify-content: flex-start;
              }

              .ai-extracted-data-card {
                padding: 0.25rem;
              }

              .extracted-data-section {
                padding: 0.25rem;
              }

              .ai-recommendations {
                padding: 0.125rem;
              }
          }
        `
      }} />
      </div>
    </div>
  );
};

export default DocumentReviewPage;