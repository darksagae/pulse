// Backend Service for Document Processing
const API_BASE_URL = 'http://localhost:8000';

export interface DocumentData {
  id?: string;
  user_id: string;
  document_type: string;
  department_id: string;
  status: 'Submitted' | 'Under Review' | 'Under Verification' | 'Payment Pending' | 'Biometrics Pending' | 'Approved' | 'Rejected' | 'Completed' | 'ai_processed' | 'submitted' | 'official_reviewed' | 'approved' | 'rejected' | 'needs_changes';
  ai_confidence?: number;
  ai_quality_score?: number;
  ai_fraud_risk?: number;
  ai_processing_time?: string;
  ai_extracted_fields?: any;
  ai_recommendations?: string[];
  ai_issues?: string[];
  images: string[];
  admin_review_comment?: string;
  admin_reviewed_at?: string;
  assigned_official_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationData {
  id?: string;
  user_id: string;
  document_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at?: string;
}

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Document Management Functions
export const saveDocument = async (documentData: Omit<DocumentData, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentData> => {
  try {
    const data = await apiRequest('/api/documents/submit', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
    return data;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

export const getDocument = async (documentId: string): Promise<DocumentData | null> => {
  try {
    const data = await apiRequest(`/api/documents/${documentId}`);
    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

export const getUserDocuments = async (citizenId: string): Promise<DocumentData[]> => {
  try {
    const data = await apiRequest(`/api/users/citizen/my-documents?user_id=${citizenId}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return [];
  }
};

export const updateDocumentStatus = async (documentId: string, status: string, updates?: Partial<DocumentData>): Promise<void> => {
  try {
    await apiRequest('/api/documents/update-status', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        status,
        ...updates
      }),
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

export const uploadDocumentImages = async (images: File[]): Promise<string[]> => {
  try {
    // For now, return mock URLs - in a real implementation, you'd upload to a file storage service
    return images.map((_, index) => `https://example.com/document-image-${index}.jpg`);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Notification Functions
export const createNotification = async (notificationData: Omit<NotificationData, 'id' | 'created_at'>): Promise<NotificationData> => {
  try {
    // Mock implementation - in a real app, this would call a backend endpoint
    return {
      ...notificationData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    // Mock implementation - in a real app, this would call a backend endpoint
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    // Mock implementation - in a real app, this would call a backend endpoint
    console.log('Marking notification as read:', notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Department Functions
export const getDepartments = async (): Promise<any[]> => {
  try {
    // Mock implementation - return the departments we know about
    return [
      { id: 'nira', name: 'NIRA', fullName: 'National Identification and Registration Authority' },
      { id: 'immigration', name: 'Immigration', fullName: 'Immigration Department' },
      { id: 'finance', name: 'Finance', fullName: 'Ministry of Finance' },
      { id: 'ursb', name: 'URSB', fullName: 'Uganda Registration Services Bureau' }
    ];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Document Workflow Functions
export const processDocumentWorkflow = async (documentId: string): Promise<any> => {
  try {
    // Mock implementation
    return {
      status: 'processed',
      confidence: 0.95,
      recommendations: ['Document appears valid']
    };
  } catch (error) {
    console.error('Error processing document workflow:', error);
    throw error;
  }
};

export const determineDepartment = async (documentType: string): Promise<string> => {
  try {
    // Simple mapping based on document type
    const departmentMap: { [key: string]: string } = {
      'national_id': 'nira',
      'drivers_license': 'nira',
      'passport': 'immigration',
      'birth_certificate': 'nira',
      'marriage_certificate': 'ursb',
      'other': 'nira'
    };
    
    return departmentMap[documentType] || 'nira';
  } catch (error) {
    console.error('Error determining department:', error);
    return 'nira';
  }
};

export const assignToOfficial = async (documentId: string, officialId: string): Promise<void> => {
  try {
    await apiRequest('/api/documents/assign', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        official_id: officialId
      }),
    });
  } catch (error) {
    console.error('Error assigning document to official:', error);
    throw error;
  }
};

// Statistics Functions
export const getDocumentStats = async (): Promise<any> => {
  try {
    const data = await apiRequest('/api/admin/stats');
    return data;
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return {
      totalDocuments: 0,
      pendingDocuments: 0,
      approvedDocuments: 0,
      rejectedDocuments: 0,
      underReviewDocuments: 0
    };
  }
};

export const getAIPerformanceMetrics = async (): Promise<any[]> => {
  try {
    // Mock implementation - return array format expected by AdminPage
    return [
      {
        ai_confidence: 0.95,
        ai_quality_score: 0.92,
        ai_processing_time: '2.3',
        ai_fraud_risk: 0.15,
        created_at: new Date().toISOString()
      },
      {
        ai_confidence: 0.88,
        ai_quality_score: 0.89,
        ai_processing_time: '1.8',
        ai_fraud_risk: 0.22,
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching AI performance metrics:', error);
    return [];
  }
};
