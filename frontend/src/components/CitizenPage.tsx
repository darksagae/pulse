import React, { useState, useRef } from 'react';
import ugFlag from '../assets/images/ug.png';
import citizenImg from '../assets/images/citizen.png';
import './PageStyles.css';

const CitizenPage: React.FC = () => {
  const [showDocumentSubmission, setShowDocumentSubmission] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for user's documents and feedback
  const userDocuments = [
    {
      id: 'DOC001',
      type: 'National ID Application',
      department: 'NIRA',
      status: 'Under Review',
      submittedDate: '2024-01-15',
      estimatedCompletion: '2024-01-29',
      progress: 60,
      updates: [
        { date: '2024-01-15', message: 'Document submitted successfully', type: 'success' },
        { date: '2024-01-16', message: 'Initial review completed', type: 'info' },
        { date: '2024-01-18', message: 'Background verification in progress', type: 'info' },
        { date: '2024-01-20', message: 'Documents verified, proceeding to photo capture', type: 'success' }
      ]
    },
    {
      id: 'DOC002',
      type: 'Vehicle Registration',
      department: 'URSB',
      status: 'Payment Pending',
      submittedDate: '2024-01-12',
      estimatedCompletion: '2024-01-19',
      progress: 30,
      updates: [
        { date: '2024-01-12', message: 'Vehicle registration application submitted', type: 'success' },
        { date: '2024-01-13', message: 'Vehicle verification completed', type: 'info' },
        { date: '2024-01-14', message: 'Payment required to proceed', type: 'warning' }
      ]
    },
    {
      id: 'DOC003',
      type: 'Passport Application',
      department: 'Immigration',
      status: 'Completed',
      submittedDate: '2023-12-20',
      estimatedCompletion: '2024-01-10',
      progress: 100,
      updates: [
        { date: '2023-12-20', message: 'Passport application submitted', type: 'success' },
        { date: '2023-12-22', message: 'Biometric data captured', type: 'info' },
        { date: '2024-01-05', message: 'Security clearance completed', type: 'info' },
        { date: '2024-01-10', message: 'Passport ready for collection', type: 'success' }
      ]
    }
  ];

  const notifications = [
    { id: 1, title: 'Document Status Update', message: 'Your National ID application is now under review', time: '2 hours ago', unread: true },
    { id: 2, title: 'Payment Required', message: 'Please complete payment for your vehicle registration', time: '1 day ago', unread: true },
    { id: 3, title: 'Document Ready', message: 'Your passport is ready for collection', time: '3 days ago', unread: false }
  ];

  const handleDocumentSubmissionClick = () => {
    setShowDocumentSubmission(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review': return '#2196F3';
      case 'Payment Pending': return '#FF9800';
      case 'Completed': return '#4CAF50';
      case 'Rejected': return '#F44336';
      case 'Pending Review': return '#FFC107';
      default: return '#757575';
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'info': return '#2196F3';
      default: return '#757575';
    }
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '';
      case 'warning': return '';
      case 'error': return '';
      case 'info': return '';
      default: return '';
    }
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
        setCapturedImage(imageData);
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
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submitDocument = () => {
    // Handle document submission logic here
    alert('Document submitted successfully!');
    setCapturedImage(null);
    setShowDocumentSubmission(false);
  };

  const goBack = () => {
    setShowDocumentSubmission(false);
    setShowCamera(false);
    setCapturedImage(null);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header">
          <img src={citizenImg} alt="Citizen" className="page-icon" />
          <h1 className="page-title">Citizen Portal</h1>
          <p className="page-subtitle">Welcome to PublicPulse Citizen Services</p>
        </div>

        {/* Navigation Tabs */}
        <div className="citizen-tabs">
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
            My Documents
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="notification-badge">{notifications.filter(n => n.unread).length}</span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Document
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="citizen-dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Documents</h3>
                <div className="stat-number">{userDocuments.length}</div>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <div className="stat-number">{userDocuments.filter(d => d.status !== 'Completed').length}</div>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <div className="stat-number">{userDocuments.filter(d => d.status === 'Completed').length}</div>
              </div>
              <div className="stat-card">
                <h3>Unread Notifications</h3>
                <div className="stat-number">{notifications.filter(n => n.unread).length}</div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {userDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="activity-item">
                    <div className="activity-content">
                      <h4>{doc.type}</h4>
                      <p>Status: <span style={{ color: getStatusColor(doc.status) }}>{doc.status}</span></p>
                      <p>Progress: {doc.progress}%</p>
                    </div>
                    <div className="activity-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${doc.progress}%`, backgroundColor: getStatusColor(doc.status) }}
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
            <h3>My Documents</h3>
            <div className="documents-list">
              {userDocuments.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className="document-header">
                    <h4>{doc.type}</h4>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(doc.status) }}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <div className="document-info">
                    <p><strong>Department:</strong> {doc.department}</p>
                    <p><strong>Submitted:</strong> {doc.submittedDate}</p>
                    <p><strong>Estimated Completion:</strong> {doc.estimatedCompletion}</p>
                  </div>
                  <div className="document-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{doc.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${doc.progress}%`, backgroundColor: getStatusColor(doc.status) }}
                      ></div>
                    </div>
                  </div>
                  <div className="document-updates">
                    <h5>Recent Updates:</h5>
                    {doc.updates.slice(0, 2).map((update, index) => (
                      <div key={index} className="update-item">
                        <span className="update-icon">{getUpdateTypeIcon(update.type)}</span>
                        <div className="update-content">
                          <p>{update.message}</p>
                          <small>{update.date}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="citizen-notifications">
            <h3>Notifications</h3>
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{notification.time}</small>
                  </div>
                  {notification.unread && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Document Tab */}
        {activeTab === 'submit' && (
          <div className="citizen-submit">
            <div className="page-features">
              <div className="feature-card clickable" onClick={handleDocumentSubmissionClick}>
                <h3>Document Submission</h3>
                <p>Submit your documents online for processing</p>
              </div>
              <div className="feature-card">
                <h3>Track Status</h3>
                <p>Monitor the progress of your submitted documents</p>
              </div>
              <div className="feature-card">
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

                               {!showCamera && !capturedImage && (
                     <div className="submission-options">
                       <button className="action-btn primary" onClick={startCamera}>
                         Take Photo
                       </button>
                       <button 
                         className="action-btn secondary" 
                         onClick={() => fileInputRef.current?.click()}
                       >
                         Upload Document
                       </button>
                       <input
                         ref={fileInputRef}
                         type="file"
                         accept="image/*,.pdf,.doc,.docx"
                         onChange={handleFileUpload}
                         style={{ display: 'none' }}
                       />
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

                               {capturedImage && (
                     <div className="document-preview">
                       <h3 className="preview-title">Document Preview</h3>
                       <div className="preview-container">
                         <img src={capturedImage} alt="Document Preview" className="preview-image" />
                         <div className="preview-actions">
                           <button className="action-btn secondary" onClick={startCamera}>
                             Retake
                           </button>
                           <button className="action-btn secondary" onClick={clearImage}>
                             Remove
                           </button>
                           <button className="action-btn primary" onClick={submitDocument}>
                             Submit Document
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

      </div>
    </div>
  );
};

export default CitizenPage;
