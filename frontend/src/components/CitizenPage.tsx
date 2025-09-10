import React, { useState, useRef, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import citizenIcon from '../assets/images/citizen.png';
import { DocumentData, NotificationData } from '../lib/backend-service';
import { citizen } from '../lib/api';
import './PageStyles.css';
import '../styles/glassmorphism.css';

const CitizenPage: React.FC = () => {
  const [showDocumentSubmission, setShowDocumentSubmission] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userDocuments, setUserDocuments] = useState<DocumentData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available document types
  const documentTypes = [
    { value: 'national_id', label: 'National ID' },
    { value: 'drivers_license', label: 'Driver\'s License' },
    { value: 'passport', label: 'Passport' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'marriage_certificate', label: 'Marriage Certificate' },
    { value: 'other', label: 'Other Document' }
  ];

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connection test successful:', data);
        setBackendConnected(true);
        return true;
      } else {
        console.error('Backend connection test failed:', response.status, response.statusText);
        setBackendConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Backend connection test error:', error);
      setBackendConnected(false);
      return false;
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Test backend connection first
        const isBackendConnected = await testBackendConnection();
        if (!isBackendConnected) {
          console.warn('Backend connection test failed, but continuing with data load...');
        }
        
        // Fetch via backend with Authorization (middleware-protected)
        const docs = await citizen.getMyDocuments();
        // Backend returns minimal fields; cast for UI consumption
        setUserDocuments(docs as unknown as DocumentData[]);
        
        // For now, use empty notifications - in real app, this would come from API
        setNotifications([]);
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleDocumentSubmissionClick = () => {
    setShowDocumentSubmission(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review': return '#2196F3';
      case 'Payment Pending': return '#FF9800';
      case 'Approved': return '#4CAF50';
      case 'Rejected': return '#F44336';
      case 'Submitted': return '#9C27B0';
      case 'ai_processed': return '#3B82F6';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ai_processed': return 'AI Processed';
      default: return status;
    }
  };

  const getProgressPercent = (status: string) => {
    if (status === 'Approved') return 100;
    if (status === 'Under Review') return 75;
    if (status === 'Submitted' || status === 'ai_processed') return 50;
    return 25;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImages(prev => [...prev, imageData]);
        setShowCamera(false);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCapturedImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const clearAllImages = () => {
    setCapturedImages([]);
    setCurrentImageIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= index && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev < capturedImages.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : capturedImages.length - 1
    );
  };

  // Document submission function - AI processing happens in background
  const submitDocument = async (images: string[], documentType: string, description: string) => {
    setLoading(true);
    setSubmissionSuccess(false);
    setSubmissionError(null);

    try {
      console.log('Submitting document...');
      console.log('Document type:', documentType);
      console.log('Description:', description);
      console.log('Images count:', images.length);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('User not authenticated. Please login again.');
      }
      console.log('Auth token found:', token.substring(0, 20) + '...');
      
      // Submit via backend API client (Authorization included)
      const result = await citizen.submitDocument({
        document_type: documentType,
        department_id: null,
        images,
        description,
      });
      console.log('Submission result:', result);
      
      // Show AI processing message
      setSubmissionSuccess(true);
      
      // Refresh user documents via backend
      try {
        const docs = await citizen.getMyDocuments();
        setUserDocuments(docs as unknown as DocumentData[]);
      } catch (docError) {
        console.warn('Could not refresh documents:', docError);
        // Don't fail the submission if we can't refresh documents
      }
      
      // Clear form
      setCapturedImages([]);
      setShowDocumentSubmission(false);
      
      return result;
      
    } catch (error) {
      console.error('Error submitting document:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to server. Please check your internet connection and try again.';
        } else if (error.message.includes('User not authenticated')) {
          errorMessage = 'Authentication error: Please login again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmissionError(errorMessage);
      alert(`Failed to submit document: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Simple document submission form
  const handleDocumentSubmit = async () => {
    if (capturedImages.length === 0) {
      alert('Please capture or upload at least one image');
      return;
    }

    if (!selectedDocumentType) {
      alert('Please select a document type');
      return;
    }

    console.log('Starting document submission...');
    console.log('Document type:', selectedDocumentType);
    console.log('Description:', documentDescription);
    console.log('Images count:', capturedImages.length);

    await submitDocument(capturedImages, selectedDocumentType, documentDescription);
  };

  const goBack = () => {
    setShowDocumentSubmission(false);
    setShowCamera(false);
    setCapturedImages([]);
    setCurrentImageIndex(0);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Test function to debug submission
  const testSubmission = async () => {
    console.log('Testing submission with mock data...');
    try {
      const response = await fetch('http://localhost:8000/documents/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'citizen_001',
          title: 'Test Document',
          description: 'Test submission from frontend',
          document_type: 'national_id'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test submission successful:', result);
        alert('Test submission successful! Check console for details.');
      } else {
        console.error('Test submission failed:', response.status, response.statusText);
        alert('Test submission failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test submission error:', error);
      alert('Test submission error. Check console for details.');
    }
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header glass-card-lg">
          <img 
            src={citizenIcon}
            alt="Citizen Portal" 
            className="citizen-icon-image"
          />
          <h1 className="page-title">Citizen Portal</h1>
          <p className="page-subtitle">Welcome to PublicPulse Citizen Services</p>
          
          {/* Connection Status Indicator */}
          {backendConnected !== null && (
            <div className="connection-status" style={{
              marginTop: '10px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9em',
              backgroundColor: backendConnected ? '#d4edda' : '#f8d7da',
              color: backendConnected ? '#155724' : '#721c24',
              border: `1px solid ${backendConnected ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {backendConnected ? '✅ Connected to server' : '❌ Server connection failed'}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="citizen-tabs glass-card">
          <button 
            className={`tab-btn glass-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            My Documents
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge glass-badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </button>
          <button 
            className={`tab-btn glass-button ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Document
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="citizen-dashboard">
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <h3>Total Documents</h3>
                <div className="stat-number">{userDocuments.length}</div>
              </div>
              <div className="stat-card glass-card">
                <h3>In Progress</h3>
                <div className="stat-number">{userDocuments.filter(d => d.status !== 'Approved').length}</div>
              </div>
              <div className="stat-card glass-card">
                <h3>Completed</h3>
                <div className="stat-number">{userDocuments.filter(d => d.status === 'Approved').length}</div>
              </div>
              <div className="stat-card glass-card">
                <h3>Unread Notifications</h3>
                <div className="stat-number">{notifications.filter(n => !n.read).length}</div>
              </div>
            </div>

            <div className="recent-activity glass-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {userDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="activity-item">
                    <div className="activity-content">
                      <h4>{doc.document_type}</h4>
                      <p>Status: <span style={{ color: getStatusColor(doc.status) }}>{getStatusText(doc.status)}</span></p>
                      <p>Department: {doc.department_id?.toUpperCase() || 'NIRA'}</p>
                    </div>
                    <div className="activity-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${getProgressPercent(doc.status)}%`,
                            backgroundColor: getStatusColor(doc.status) 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="citizen-documents">
            <div className="section-header glass-card">
              <h3>My Documents</h3>
              <p>Track the status of your submitted documents</p>
            </div>
            <div className="documents-list">
              {loading ? (
                <div className="loading-state">
                  <p>Loading your documents...</p>
                </div>
              ) : userDocuments.length > 0 ? (
                userDocuments.map((doc) => (
                  <div key={doc.id} className="document-card glass-card">
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
                      <p><strong>Department:</strong> {doc.department_id?.toUpperCase() || 'NIRA'}</p>
                      <p><strong>Submitted:</strong> {new Date(doc.created_at || '').toLocaleDateString()}</p>
                      <p><strong>Last Updated:</strong> {new Date(doc.updated_at || '').toLocaleDateString()}</p>
                    </div>
                    <div className="document-progress">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{getProgressPercent(doc.status)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${getProgressPercent(doc.status)}%`,
                            backgroundColor: getStatusColor(doc.status) 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="document-updates">
                      <h5>Status Updates:</h5>
                    <div className="update-item">
                      <div className="update-content">
                        <p>Document submitted for processing</p>
                        <small>{new Date(doc.created_at || '').toLocaleDateString()}</small>
                      </div>
                    </div>
                    {doc.status === 'Under Review' && (
                      <div className="update-item">
                        <div className="update-content">
                          <p>Document is under review by officials</p>
                          <small>Processing time: 2-3 business days</small>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No documents found. Submit your first document to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="citizen-notifications">
            <div className="section-header glass-card">
              <h3>Notifications</h3>
              <p>Stay updated with your document status</p>
            </div>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className={`notification-item glass-card ${!notification.read ? 'unread' : ''}`}>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <small>{new Date(notification.created_at || '').toLocaleString()}</small>
                    </div>
                    {!notification.read && <div className="unread-indicator"></div>}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No notifications yet. You'll receive updates about your document status here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Document Tab */}
        {activeTab === 'submit' && (
          <div className="citizen-submit">
            <div className="section-header glass-card">
              <h3>Submit Document</h3>
              <p>Upload your documents for government processing</p>
            </div>
            <div className="page-features">
              <div className="feature-card glass-card clickable" onClick={handleDocumentSubmissionClick}>
                <h3>Document Submission</h3>
                <p>Submit your documents online for processing</p>
              </div>
              <div className="feature-card glass-card">
                <h3>Track Status</h3>
                <p>Monitor the progress of your submitted documents</p>
              </div>
              <div className="feature-card glass-card">
                <h3>Get Updates</h3>
                <p>Receive notifications about your document status</p>
              </div>
            </div>
          </div>
        )}

        {!showDocumentSubmission && (
          <div className="page-actions">
            <button className="action-btn secondary">Check Status</button>
            <button className="action-btn secondary">View History</button>
            <button className="action-btn secondary" onClick={testSubmission}>
              Test Submission
            </button>
          </div>
        )}

        {showDocumentSubmission && (
          <div className="document-submission-interface">
            <div className="submission-header">
              <button className="back-btn" onClick={goBack}>
                Back
              </button>
              <h2 className="submission-title">Document Submission</h2>
            </div>

            {!showCamera && capturedImages.length === 0 && (
              <div className="submission-options">
                {submissionSuccess && (
                  <div className="success-message glass-card">
                    <h3>Document Submitted Successfully!</h3>
                    <p>Your document has been submitted and is being processed by AI in the background.</p>
                    <div className="ai-processing-info">
                      <div className="processing-step">
                        <span className="step-icon">🤖</span>
                        <span>AI is extracting your name and document information...</span>
                      </div>
                      <div className="processing-step">
                        <span className="step-icon">📋</span>
                        <span>Document will be assigned to the appropriate department</span>
                      </div>
                      <div className="processing-step">
                        <span className="step-icon">👤</span>
                        <span>Official will review and process your document</span>
                      </div>
                    </div>
                    <p>You will receive updates on the status as it progresses through the system.</p>
                    <div className="success-actions">
                      <button 
                        className="action-btn primary" 
                        onClick={() => setSubmissionSuccess(false)}
                      >
                        Submit Another Document
                      </button>
                      <button 
                        className="action-btn secondary" 
                        onClick={() => {
                          setSubmissionSuccess(false);
                          setShowDocumentSubmission(false);
                        }}
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                )}
                
                {!submissionSuccess && (
                  <>
                    <button className="action-btn primary" onClick={startCamera}>
                      Take Photo
                    </button>
                    <button 
                      className="action-btn secondary" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Documents
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-hint">
                      <p><strong>Tip:</strong> You can upload multiple images for complete document processing (front/back, different pages, etc.)</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {showCamera && (
              <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <div className="camera-buttons">
                  <button className="action-btn primary" onClick={capturePhoto}>
                    Capture
                  </button>
                  <button className="action-btn secondary" onClick={stopCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedImages.length > 0 && (
              <div className="document-preview">
                <h3 className="preview-title">
                  Document Preview ({capturedImages.length} image{capturedImages.length > 1 ? 's' : ''})
                </h3>
                
                {/* Form Status Indicator */}
                <div className="form-status" style={{
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '8px',
                  backgroundColor: capturedImages.length > 0 && selectedDocumentType ? '#d4edda' : '#f8d7da',
                  border: capturedImages.length > 0 && selectedDocumentType ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                  color: capturedImages.length > 0 && selectedDocumentType ? '#155724' : '#721c24'
                }}>
                  <strong>Form Status:</strong> {
                    capturedImages.length === 0 ? '❌ No images captured' :
                    !selectedDocumentType ? '❌ Document type not selected' :
                    '✅ Ready to submit'
                  }
                </div>
                
                {/* Document Type Selection */}
                <div className="document-type-selection">
                  <label htmlFor="document-type">Document Type: <span style={{color: 'red'}}>*</span></label>
                  <select 
                    id="document-type"
                    value={selectedDocumentType} 
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className="document-type-select"
                    style={{border: !selectedDocumentType ? '2px solid #ff6b6b' : '2px solid #4ecdc4'}}
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {!selectedDocumentType && (
                    <p style={{color: '#ff6b6b', fontSize: '0.9em', margin: '5px 0'}}>
                      Please select a document type to enable submission
                    </p>
                  )}
                </div>

                {/* Document Description */}
                <div className="document-description">
                  <label htmlFor="document-description">Description (Optional):</label>
                  <textarea
                    id="document-description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Add any additional details about your document..."
                    className="document-description-textarea"
                    rows={3}
                  />
                </div>
                
                {capturedImages.length > 1 && (
                  <div className="image-navigation">
                    <button className="nav-btn" onClick={prevImage} disabled={capturedImages.length <= 1}>
                      ← Previous
                    </button>
                    <span className="image-counter">
                      {currentImageIndex + 1} of {capturedImages.length}
                    </span>
                    <button className="nav-btn" onClick={nextImage} disabled={capturedImages.length <= 1}>
                      Next →
                    </button>
                  </div>
                )}
                
                <div className="preview-container">
                  <img 
                    src={capturedImages[currentImageIndex]} 
                    alt={`Document Preview ${currentImageIndex + 1}`} 
                    className="preview-image" 
                  />
                  
                  {capturedImages.length > 1 && (
                    <div className="image-thumbnails">
                      {capturedImages.map((img, index) => (
                        <div 
                          key={index} 
                          className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img src={img} alt={`Thumbnail ${index + 1}`} />
                          <button 
                            className="remove-thumbnail"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="preview-actions">
                    <button className="action-btn secondary" onClick={startCamera}>
                      Add More Photos
                    </button>
                    <button className="action-btn secondary" onClick={clearAllImages}>
                      Remove All
                    </button>
                    <button 
                      className="action-btn primary" 
                      onClick={handleDocumentSubmit}
                      disabled={loading || !selectedDocumentType}
                      title={!selectedDocumentType ? 'Please select a document type first' : 'Submit your document'}
                    >
                      {loading ? 'Submitting...' : 'Submit Document'}
                    </button>
                    {!selectedDocumentType && (
                      <p style={{color: '#ff6b6b', fontSize: '0.9em', margin: '10px 0', textAlign: 'center'}}>
                        ⚠️ Select a document type above to enable submission
                      </p>
                    )}
                    
                    {/* Error Display */}
                    {submissionError && (
                      <div style={{
                        margin: '10px 0',
                        padding: '10px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        border: '1px solid #f5c6cb',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <p style={{margin: '0 0 10px 0'}}>❌ {submissionError}</p>
                        <button 
                          className="action-btn secondary"
                          onClick={() => {
                            setSubmissionError(null);
                            handleDocumentSubmit();
                          }}
                          style={{marginRight: '10px'}}
                        >
                          Retry Submission
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => setSubmissionError(null)}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .ai-processing-info {
            margin: 20px 0;
            padding: 15px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }
          
          .processing-step {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 8px 0;
            font-size: 0.95em;
          }
          
          .step-icon {
            font-size: 1.2em;
            margin-right: 12px;
            min-width: 30px;
          }
          
          .processing-step span:last-child {
            color: #374151;
            font-weight: 500;
          }
        `
      }} />
    </div>
  );
};

export default CitizenPage;