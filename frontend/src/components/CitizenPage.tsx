import React, { useState, useEffect } from 'react';
import ugFlag from '../assets/images/ug.png';
import citizenIcon from '../assets/images/citizen.png';
import { DocumentData, NotificationData } from '../lib/backend-service';
import { citizen } from '../lib/api';
import { geminiAIService, ExtractedData } from '../lib/gemini-ai-service';
import { imageMerger } from '../lib/image-merger';
import { imageOptimizer } from '../lib/image-optimizer';
import './PageStyles.css';
import '../styles/glassmorphism.css';

const CitizenPage: React.FC = () => {
  const [showDocumentSubmission, setShowDocumentSubmission] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userDocuments, setUserDocuments] = useState<DocumentData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [aiExtractionData, setAiExtractionData] = useState<ExtractedData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Available document types
  const documentTypes = [
    { value: 'national_id', label: 'National ID' },
    { value: 'drivers_license', label: 'Driver\'s License' },
    { value: 'passport', label: 'Passport' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'marriage_certificate', label: 'Marriage Certificate' },
    { value: 'other', label: 'Other Document' }
  ];

  // Department mapping for document routing
  const departmentMapping = {
    'national_id': 'nira',
    'drivers_license': 'ursb',
    'passport': 'immigration',
    'birth_certificate': 'nira',
    'marriage_certificate': 'nira',
    'other': 'general'
  };

  // Available departments
  const departments = [
    { value: 'nira', label: 'NIRA (National ID & Registration Authority)' },
    { value: 'ursb', label: 'URSB (Uganda Registration Services Bureau)' },
    { value: 'immigration', label: 'Immigration (Passports & Visas)' },
    { value: 'finance', label: 'Finance (Government Revenue)' },
    { value: 'health', label: 'Health (Medical Services)' },
    { value: 'education', label: 'Education (Academic Records)' }
  ];

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/health`);
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

  // Load user documents
  const loadUserDocuments = async () => {
    try {
      setLoading(true);
      const documents = await citizen.getMyDocuments();
      setUserDocuments(documents);
      } catch (error) {
      console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

  // Load notifications (mock data for now)
  const loadNotifications = async () => {
    try {
      // Mock notifications since the API doesn't have this method yet
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          user_id: 'user_001',
          document_id: 'doc_001',
          title: 'Document Submitted',
          message: 'Your National ID application has been submitted successfully.',
          type: 'success',
          read: false,
          created_at: new Date().toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Handle document submission
  const handleDocumentSubmissionClick = () => {
    setShowDocumentSubmission(true);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  };

  // Remove uploaded file
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-select department based on document type
  const handleDocumentTypeChange = (documentType: string) => {
    setSelectedDocumentType(documentType);
    const mappedDepartment = departmentMapping[documentType as keyof typeof departmentMapping];
    if (mappedDepartment) {
      setSelectedDepartment(mappedDepartment);
    }
  };

  // Generate unique card number
  const generateCardNumber = (department: string, documentType: string) => {
    const timestamp = Date.now().toString().slice(-6);
    const deptCode = department.substring(0, 3).toUpperCase();
    const docCode = documentType.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${deptCode}-${docCode}-${timestamp}-${randomNum}`;
  };

  // Route images to appropriate department
  const routeImagesToDepartment = async (images: File[], department: string, documentType: string, cardNum: string) => {
    try {
      setIsExtracting(true);
      
      // Convert files to base64 for transmission
      const imageData = await Promise.all(
        images.map(file => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }))
      );

      // Merge images if there are multiple (e.g., front and back of ID card)
      let processedImageData: string[];
      
      if (imageData.length >= 2) {
        console.log('Merging', imageData.length, 'images into a single image...');
        try {
          const mergedImage = await imageMerger.mergeImages(imageData, {
            layout: 'horizontal', // Side by side
            maxWidth: 8000,      // No artificial limit - optimizer will handle size
            maxHeight: 8000,
            quality: 0.95,
            spacing: 30
          });
          processedImageData = [mergedImage];
          console.log('Successfully merged images into one');
        } catch (mergeError) {
          console.error('Error merging images, using original images:', mergeError);
          processedImageData = imageData;
        }
      } else {
        processedImageData = imageData;
      }

      // Optimize images for Gemini API (handles large images automatically)
      console.log('Optimizing images for AI processing...');
      setIsOptimizing(true);
      try {
        const optimizedImages = await imageOptimizer.optimizeBatch(
          processedImageData,
          {
            maxFileSizeMB: 3.5,      // Gemini limit is ~4MB, stay under with buffer
            maxWidth: 4096,          // Gemini max dimension
            maxHeight: 4096,
            initialQuality: 0.95,
            minQuality: 0.70
          },
          (current, total) => {
            console.log(`Optimizing image ${current}/${total}...`);
          }
        );
        processedImageData = optimizedImages;
        console.log('Image optimization completed successfully');
      } catch (optimizeError) {
        console.error('Error optimizing images, proceeding with unoptimized:', optimizeError);
        // Continue with unoptimized images
      } finally {
        setIsOptimizing(false);
      }

      // Extract data using Gemini AI
      console.log('Starting AI extraction for', processedImageData.length, 'image(s)');
      let extractionResults: any[] = [];
      let successfulExtractions: ExtractedData[] = [];
      
      try {
        extractionResults = await geminiAIService.extractMultipleDocuments(processedImageData, documentType);
        
        // Log all results for debugging
        console.log('All extraction results:', extractionResults);
        
        // Filter successful extractions
        successfulExtractions = extractionResults
          .filter(result => result.success && result.data)
          .map(result => result.data!);
        
        console.log('Successful extractions:', successfulExtractions.length, 'out of', extractionResults.length);
        setAiExtractionData(successfulExtractions);
        console.log('AI extraction completed:', successfulExtractions);
      } catch (aiError) {
        console.error('AI extraction failed, continuing with submission:', aiError);
        // Continue with submission even if AI fails
        extractionResults = [];
        successfulExtractions = [];
      }

      // Create submission data with card number and AI extraction
      const submissionData = {
        id: cardNum,
        documentType,
        department,
        images: processedImageData, // Use merged image(s) instead of original
        originalImageCount: imageData.length, // Keep track of how many images were merged
        timestamp: new Date().toISOString(),
        citizenId: 'citizen_001', // This would come from user authentication
        status: 'submitted',
        cardNumber: cardNum,
        aiExtractedData: successfulExtractions,
        aiProcessingTime: Array.isArray(extractionResults) ? extractionResults.reduce((total, result) => total + result.processingTime, 0) : 0
      };

      // Store in localStorage for department access (in real app, this would be API call)
      try {
        const existingSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
        if (!existingSubmissions[department]) {
          existingSubmissions[department] = [];
        }
        existingSubmissions[department].push(submissionData);
        localStorage.setItem('departmentSubmissions', JSON.stringify(existingSubmissions));
        
        console.log('Stored submission data with AI extraction:', submissionData);
        console.log('Updated department submissions:', existingSubmissions);

        // Also store in a global submissions array for tracking
        const globalSubmissions = JSON.parse(localStorage.getItem('globalSubmissions') || '[]');
        globalSubmissions.push(submissionData);
        localStorage.setItem('globalSubmissions', JSON.stringify(globalSubmissions));

        console.log(`Images routed to ${department} department with card number ${cardNum} and AI extraction:`, submissionData);
      } catch (storageError) {
        console.error('Error storing submission data:', storageError);
        // Try to clear some space and retry
        try {
          // Clear old submissions if localStorage is full
          localStorage.removeItem('globalSubmissions');
          const existingSubmissions = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
          if (!existingSubmissions[department]) {
            existingSubmissions[department] = [];
          }
          existingSubmissions[department].push(submissionData);
          localStorage.setItem('departmentSubmissions', JSON.stringify(existingSubmissions));
          console.log('Stored submission after clearing space');
        } catch (retryError) {
          console.error('Failed to store submission even after clearing:', retryError);
          throw new Error('Storage quota exceeded. Please contact support.');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error routing images to department:', error);
      throw error; // Re-throw to be caught by handleDocumentSubmit
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle document submit
  const handleDocumentSubmit = async () => {
    try {
      setLoading(true);
      setSubmissionError(null);
      
      if (!selectedDocumentType || !selectedDepartment || uploadedFiles.length === 0) {
        setSubmissionError('Please fill in all required fields and upload at least one image.');
        setLoading(false);
        return;
      }

      // Generate card number
      const generatedCardNumber = generateCardNumber(selectedDepartment, selectedDocumentType);
      setCardNumber(generatedCardNumber);

      console.log('Starting document submission...');
      console.log('Document type:', selectedDocumentType);
      console.log('Department:', selectedDepartment);
      console.log('Number of files:', uploadedFiles.length);

      // Route images to the appropriate department
      await routeImagesToDepartment(
        uploadedFiles, 
        selectedDepartment, 
        selectedDocumentType,
        generatedCardNumber
      );

      // If we reach here, submission was successful
      console.log('Document submission successful!');
      setSubmissionSuccess(true);
      setUploadedFiles([]);
      setSelectedDocumentType('');
      setSelectedDepartment('');
      setDocumentDescription('');
      
      // Load user documents (if applicable)
      try {
        await loadUserDocuments();
      } catch (loadError) {
        console.error('Error loading documents after submission:', loadError);
        // Don't fail the submission for this
      }
      
    } catch (error) {
      console.error('Document submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit document. Please try again.';
      setSubmissionError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear all images
  const clearAllImages = () => {
    setCapturedImages([]);
    setUploadedFiles([]);
    setCurrentImageIndex(0);
  };

  // Remove image
  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= index && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Go back
  const goBack = () => {
    setShowDocumentSubmission(false);
    setCapturedImages([]);
    setUploadedFiles([]);
    setCurrentImageIndex(0);
    setSelectedDocumentType('');
    setSelectedDepartment('');
    setDocumentDescription('');
    setSubmissionError(null);
    setSubmissionSuccess(false);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10b981';
      case 'Under Review': return '#f59e0b';
      case 'Rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get status progress
  const getStatusProgress = (status: string) => {
    if (status === 'Approved') return 100;
    if (status === 'Under Review') return 75;
    if (status === 'Submitted' || status === 'ai_processed') return 50;
    return 25;
  };

  useEffect(() => {
    testBackendConnection();
    loadUserDocuments();
    loadNotifications();
  }, []);

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header">
          <div className="header-content">
            <img src={citizenIcon} alt="Citizen" className="citizen-icon-image" />
            <div className="header-text">
              <h1>Citizen Portal</h1>
              <p>Access your documents and services</p>
            </div>
          </div>
          <div className="connection-status">
            {backendConnected === true && (
              <span className="status-indicator connected">🟢 Connected</span>
            )}
            {backendConnected === false && (
              <span className="status-indicator disconnected">🔴 Disconnected</span>
            )}
            {backendConnected === null && (
              <span className="status-indicator checking">🟡 Checking...</span>
            )}
          </div>
        </div>

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
                ← Back
          </button>
              <h2 className="submission-title">Document Submission</h2>
        </div>
            
            {submissionSuccess ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Document Submitted Successfully!</h3>
                <p>Your document has been routed to the {departments.find(d => d.value === selectedDepartment)?.label} department for processing.</p>
                <div className="card-number-display">
                  <h4>Your Reference Card Number:</h4>
                  <div className="card-number">{cardNumber}</div>
                  <p className="card-instruction">Please keep this card number safe. Officials will use this number to access your documents.</p>
                </div>
                <div className="success-actions">
                  <button className="action-btn primary" onClick={goBack}>
                    Submit Another Document
                  </button>
                </div>
              </div>
            ) : (
              <div className="submission-form">
                {/* Document Type Selection */}
                <div className="form-section">
                  <label className="form-label">Document Type *</label>
                  <select 
                    className="glass-select"
                    value={selectedDocumentType}
                    onChange={(e) => handleDocumentTypeChange(e.target.value)}
                    required
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Selection */}
                <div className="form-section">
                  <label className="form-label">Department *</label>
                  <select 
                    className="glass-select"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Description */}
                <div className="form-section">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="glass-textarea"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Provide additional details about your document..."
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div className="form-section">
                  <label className="form-label">Upload Images *</label>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">
                        <strong>Click to upload images</strong>
                        <span>or drag and drop files here</span>
                      </div>
                    </label>
                  </div>
                  
                  {/* Info message for multiple images */}
                  {uploadedFiles.length >= 2 && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#3b82f6'
                    }}>
                      ℹ️ Multiple images will be automatically combined into one for better processing
                    </div>
                  )}
                  
                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      <h4>Uploaded Images ({uploadedFiles.length})</h4>
                      <div className="files-grid">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="file-preview">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index + 1}`}
                              className="preview-image"
                            />
                            <div className="file-info">
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            <button 
                              className="remove-file-btn"
                              onClick={() => removeUploadedFile(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {submissionError && (
                  <div className="error-message" style={{
                    padding: '15px',
                    marginTop: '15px',
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '2px solid #dc3545',
                    borderRadius: '8px',
                    color: '#dc3545',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span className="error-icon">⚠️</span>
                    {submissionError}
                    {submissionError.includes('Storage quota') && (
                      <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'normal' }}>
                        <button 
                          onClick={() => {
                            localStorage.clear();
                            setSubmissionError(null);
                            alert('Storage cleared. Please try submitting again.');
                          }}
                          style={{
                            padding: '5px 10px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Clear Storage & Retry
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="form-actions">
                  <button 
                    className="action-btn secondary" 
                    onClick={goBack}
                  >
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleDocumentSubmit}
                    disabled={loading || isExtracting || isOptimizing || !selectedDocumentType || !selectedDepartment || uploadedFiles.length === 0}
                  >
                    {isOptimizing ? '⚙️ Optimizing Images...' :
                     isExtracting ? '🤖 AI Extracting Data...' : 
                     loading ? 'Submitting...' : 'Submit Document'}
                  </button>
                </div>
            </div>
            )}
          </div>
        )}

        {!showDocumentSubmission && (
          <div className="page-features">
            <div className="feature-card glass-card clickable" onClick={handleDocumentSubmissionClick}>
              <h3>Document Submission</h3>
              <p>Submit your documents online for processing</p>
            </div>
            <div className="feature-card glass-card">
              <h3>Get Updates</h3>
              <p>Receive notifications about your document status</p>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && !showDocumentSubmission && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <h3>Documents</h3>
                <p className="stat-number">{userDocuments.length}</p>
                <p className="stat-label">Total Documents</p>
              </div>
              <div className="stat-card glass-card">
                <h3>Notifications</h3>
                <p className="stat-number">{notifications.length}</p>
                <p className="stat-label">Unread Messages</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && !showDocumentSubmission && (
          <div className="documents-content">
            <div className="documents-list">
              {userDocuments.length > 0 ? (
                userDocuments.map((doc, index) => (
                  <div key={index} className="document-card glass-card">
                    <div className="document-header">
                      <h3>{doc.document_type}</h3>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(doc.status) }}
                        >
                        {doc.status}
                        </span>
                    </div>
                    <div className="document-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${getStatusProgress(doc.status)}%`,
                            backgroundColor: getStatusColor(doc.status) 
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{getStatusProgress(doc.status)}% Complete</span>
                    </div>
                    <div className="document-details">
                      <p><strong>Submitted:</strong> {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Last Updated:</strong> {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'N/A'}</p>
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
        {activeTab === 'notifications' && !showDocumentSubmission && (
          <div className="notifications-content">
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="notification-card glass-card">
                    <div className="notification-header">
                      <h3>{notification.title}</h3>
                      <span className="notification-time">
                        {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <p>{notification.message}</p>
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
        {activeTab === 'submit' && !showDocumentSubmission && (
          <div className="submit-content">
            <div className="submit-options">
              <div className="feature-card glass-card clickable" onClick={handleDocumentSubmissionClick}>
                <h3>Document Submission</h3>
                <p>Submit your documents online for processing</p>
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
          </div>
        )}

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

          /* Document Submission Form Styles */
          .submission-form {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }

          .form-section {
            margin-bottom: 2rem;
          }

          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
            font-size: 1rem;
          }

          .upload-area {
            position: relative;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .upload-area:hover {
            border-color: rgba(59, 130, 246, 0.5);
            background: rgba(59, 130, 246, 0.1);
          }

          .file-input {
            position: absolute;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .upload-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
          }

          .upload-icon {
            font-size: 3rem;
            opacity: 0.7;
          }

          .upload-text {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .upload-text strong {
            color: #333;
            font-size: 1.1rem;
          }

          .upload-text span {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
          }

          .uploaded-files {
            margin-top: 1.5rem;
          }

          .uploaded-files h4 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.1rem;
          }

          .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }

          .file-preview {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .preview-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 6px;
            margin-bottom: 0.5rem;
          }

          .file-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .file-name {
            color: #333;
            font-size: 0.85rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .file-size {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.75rem;
          }

          .remove-file-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            width: 24px;
            height: 24px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            transition: all 0.2s ease;
          }

          .remove-file-btn:hover {
            background: rgba(239, 68, 68, 1);
            transform: scale(1.1);
          }

          .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #ef4444;
          }

          .error-icon {
            font-size: 1.2rem;
          }

          /* Success Message Styles */
          .success-message {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(34, 197, 94, 0.1);
            border: 2px solid rgba(34, 197, 94, 0.3);
            border-radius: 16px;
            margin: 2rem 0;
          }

          .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: bounce 1s ease-in-out;
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }

          .success-message h3 {
            color: #22c55e;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 700;
          }

          .success-message p {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
            font-size: 1.1rem;
            line-height: 1.6;
          }

          .card-number-display {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
          }

          .card-number-display h4 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.2rem;
            font-weight: 600;
          }

          .card-number {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
            padding: 1rem 2rem;
            border-radius: 8px;
            margin: 1rem 0;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
          }

          .card-instruction {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            margin: 0;
            font-style: italic;
          }

          .success-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .submission-form {
              padding: 1rem;
            }

            .files-grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 0.75rem;
            }

            .form-actions {
              flex-direction: column;
            }

            .success-actions {
              flex-direction: column;
            }
          }
        `
      }} />
    </div>
  );
};

export default CitizenPage;