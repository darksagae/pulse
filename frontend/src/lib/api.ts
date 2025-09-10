// API service layer for connecting frontend to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: string;
  national_id?: string;
  official_id?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: 'citizen' | 'official' | 'admin';
  department_id?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user_id?: string;
  user_type?: string;
  access_token?: string;
  token_type?: string;
  user?: User;
}

export interface Document {
  id: string;
  citizen_id: string;
  user_id: string; // Add user_id for compatibility with DocumentData
  document_type: string;
  department_id: string;
  status: 'submitted' | 'official_reviewed' | 'approved' | 'rejected' | 'needs_changes' | 'Submitted' | 'Under Review' | 'Under Verification' | 'Payment Pending' | 'Biometrics Pending' | 'Completed' | 'ai_processed';
  images: string[];
  description?: string;
  assigned_official_id?: string;
  official_review_comment?: string;
  official_reviewed_at?: string;
  admin_review_comment?: string;
  admin_reviewed_at?: string;
  ai_confidence?: number;
  ai_quality_score?: number;
  ai_fraud_risk?: number;
  ai_processing_time?: string;
  ai_extracted_fields?: Record<string, string>;
  ai_recommendations?: string[];
  ai_issues?: string[];
  created_at: string;
  updated_at: string;
}

export interface AIResult {
  document_type: string;
  confidence: number;
  extracted_fields: Record<string, string>;
  quality_score: number;
  fraud_risk: number;
  recommendations: string[];
  issues: string[];
  processing_time: string;
}

export interface Notification {
  id: string;
  user_id: string;
  document_id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface SystemStats {
  total_users: number;
  active_sessions: number;
  documents_processed: number;
  system_uptime: string;
  pending_approvals: number;
  completed_today: number;
  ai_processed: number;
  ai_accuracy: number;
  ai_processing_time: string;
  human_review_rate: number;
}

export interface DepartmentStats {
  name: string;
  documents: number;
  completed: number;
  pending: number;
  efficiency: number;
}

// API Client class
class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async registerCitizen(userData: {
    national_id: string;
    email: string;
    full_name: string;
    phone_number: string;
    password: string;
  }) {
    return this.request<{
      message: string;
      verification_token: string;
      email: string;
    }>('/api/auth/register-citizen', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(token: string) {
    return this.request<{
      message: string;
      user_id: string;
    }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async loginCitizen(national_id: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/login-citizen', {
      method: 'POST',
      body: JSON.stringify({ national_id, password }),
    });
    
    if (response.access_token) {
      this.token = response.access_token;
      localStorage.setItem('auth_token', response.access_token);
    }
    return response;
  }

  async registerOfficial(officialData: {
    full_name: string;
    email: string;
    phone_number: string;
    department_id: string;
    password: string;
  }) {
    return this.request<{
      message: string;
      official_id: string;
      access_code: string;
      qr_code_data: string;
    }>('/auth/register-official', {
      method: 'POST',
      body: JSON.stringify(officialData),
    });
  }

  async loginAdmin(username: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
    });
    
    if (response.success && response.user_id) {
      this.token = response.user_id; // Use user_id as token
      localStorage.setItem('auth_token', response.user_id);
      
      // Create user object for compatibility
      const user = {
        id: response.user_id,
        role: response.user_type || 'admin',
        email: username,
        full_name: 'System Administrator'
      };
      
      return { ...response, user };
    } else {
      throw new Error(response.message || 'Login failed');
    }
  }

  async loginOfficial(access_code: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/login-official', {
      method: 'POST',
      body: JSON.stringify({ access_code, password }),
    });
    
    if (response.access_token) {
      this.token = response.access_token;
      localStorage.setItem('auth_token', response.access_token);
    }
    return response;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Citizen methods
  async getMyDocuments() {
    const resp = await this.request<{ documents: Document[]; total_count?: number }>(
      '/api/users/citizen/my-documents',
      {
        method: 'GET',
      }
    );
    return resp.documents || [];
  }

  async submitCitizenDocument(payload: {
    document_type: string;
    department_id?: string | null;
    images: string[];
    description?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      document_id: string;
      status: string;
      submitted_at: string;
    }>(
      '/api/users/citizen/submit-document',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  // Document methods
  async processDocument(documentData: {
    citizen_id: string;
    document_type: string;
    department_id: string;
    images: string[];
  }) {
    return this.request<{
      document: Document;
      ai_result: AIResult;
      notification: Notification;
    }>('/documents/process', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async getDocuments(params?: {
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.append('user_id', params.user_id);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/documents/?${queryString}` : '/documents/';
    
    return this.request<Document[]>(endpoint);
  }

  async getDocument(documentId: string) {
    return this.request<Document>(`/documents/${documentId}`);
  }

  async updateDocument(documentId: string, updateData: Partial<Document>) {
    return this.request<Document>(`/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Admin methods
  async getSystemStats() {
    return this.request<SystemStats>('/admin/stats');
  }

  async getDepartmentStats() {
    return this.request<DepartmentStats[]>('/admin/departments/stats');
  }

  async getPendingDocuments(limit = 100, offset = 0) {
    return this.request<Document[]>(`/admin/documents/pending?limit=${limit}&offset=${offset}`);
  }

  async reviewDocument(documentId: string, status: string, comment?: string) {
    return this.request<{
      message: string;
      document_id: string;
      status: string;
      comment?: string;
      reviewed_at: string;
    }>(`/admin/documents/${documentId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    });
  }

  // Official methods
  async getOfficialDocuments() {
    return this.request<{ documents: Document[]; total_count?: number }>(
      '/api/users/official/documents',
      {
        method: 'GET',
      }
    );
  }
  
  async extractDocumentInformation(documentId: string) {
    return this.request<{
      success: boolean;
      message: string;
      document_id: string;
      extracted_data: any;
      ai_analysis?: any;
      extracted_at: string;
    }>(
      `/api/users/official/documents/${documentId}/extract`,
      { 
        method: 'POST',
        body: JSON.stringify({
          document_type: 'national_id',
          images: []
        })
      }
    );
  }

  async getDepartmentDocuments(departmentId: string) {
    return this.request<{ documents: Document[]; total_count?: number; department: string }>(
      `/api/users/official/documents/department/${departmentId}`,
      {
        method: 'GET',
      }
    );
  }

  async getAssignedDocuments(officialId: string) {
    return this.request<{ documents: Document[]; total_count?: number; official_id: string }>(
      `/api/users/official/documents/assigned/${officialId}`,
      {
        method: 'GET',
      }
    );
  }

  async getDocumentById(documentId: string) {
    return this.request<Document>(
      `/api/users/official/documents/${documentId}`,
      {
        method: 'GET',
      }
    );
  }

  async officialReviewDocument(documentId: string, comment: string) {
    return this.request<{
      success: boolean;
      message: string;
      document_id: string;
      status: string;
      official_comment: string;
      reviewed_by: string;
      reviewed_at: string;
    }>(`/api/users/official/documents/${documentId}/review`, {
      method: 'POST',
      body: JSON.stringify({ 
        comment,
        official_id: 'official_001'
      }),
    });
  }

  // Admin methods
  async getAdminDocuments() {
    return this.request<{ 
      documents: Document[]; 
      total_count?: number;
      department_groups?: Record<string, Document[]>;
      departments?: string[];
    }>(
      '/api/users/admin/documents',
      {
        method: 'GET',
      }
    );
  }

  async adminReviewDocument(documentId: string, action: string, comment: string) {
    return this.request<{
      success: boolean;
      message: string;
      document_id: string;
      status: string;
      admin_comment: string;
      reviewed_by: string;
      reviewed_at: string;
    }>(`/api/users/admin/documents/${documentId}/review`, {
      method: 'POST',
      body: JSON.stringify({ 
        action, 
        comment,
        admin_id: 'admin_001'
      }),
    });
  }
  
  async analyzeDocumentFraud(documentId: string) {
    return this.request<{
      success: boolean;
      message: string;
      document_id: string;
      fraud_analysis: any;
      analyzed_at: string;
    }>(
      `/api/users/admin/documents/${documentId}/analyze-fraud`,
      { method: 'POST' }
    );
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      message: string;
      timestamp: string;
    }>('/health');
  }
}

// Create and export API client instance
export const apiClient = new APIClient(API_BASE_URL);

// Export individual methods for convenience
export const auth = {
  registerCitizen: (userData: Parameters<APIClient['registerCitizen']>[0]) => 
    apiClient.registerCitizen(userData),
  verifyEmail: (token: string) => apiClient.verifyEmail(token),
  loginCitizen: (national_id: string, password: string) => 
    apiClient.loginCitizen(national_id, password),
  loginAdmin: (username: string, password: string) => 
    apiClient.loginAdmin(username, password),
  registerOfficial: (officialData: Parameters<APIClient['registerOfficial']>[0]) => 
    apiClient.registerOfficial(officialData),
  loginOfficial: (access_code: string, password: string) => 
    apiClient.loginOfficial(access_code, password),
  logout: () => apiClient.logout(),
};

export const documents = {
  process: (documentData: Parameters<APIClient['processDocument']>[0]) => 
    apiClient.processDocument(documentData),
  getAll: (params?: Parameters<APIClient['getDocuments']>[0]) => 
    apiClient.getDocuments(params),
  getById: (documentId: string) => apiClient.getDocument(documentId),
  update: (documentId: string, updateData: Partial<Document>) => 
    apiClient.updateDocument(documentId, updateData),
};

export const admin = {
  getStats: () => apiClient.getSystemStats(),
  getDepartmentStats: () => apiClient.getDepartmentStats(),
  getPendingDocuments: (limit?: number, offset?: number) => 
    apiClient.getPendingDocuments(limit, offset),
  getDocuments: () => apiClient.getAdminDocuments(),
  reviewDocument: (documentId: string, action: string, comment: string) => 
    apiClient.adminReviewDocument(documentId, action, comment),
  analyzeFraud: (documentId: string) => apiClient.analyzeDocumentFraud(documentId),
};

export const health = {
  check: () => apiClient.healthCheck(),
};

export const citizen = {
  getMyDocuments: () => apiClient.getMyDocuments(),
  submitDocument: (payload: Parameters<APIClient['submitCitizenDocument']>[0]) =>
    apiClient.submitCitizenDocument(payload),
};

export const official = {
  getDocuments: () => apiClient.getOfficialDocuments(),
  getDepartmentDocuments: (departmentId: string) => apiClient.getDepartmentDocuments(departmentId),
  getAssignedDocuments: (officialId: string) => apiClient.getAssignedDocuments(officialId),
  getDocumentById: (documentId: string) => apiClient.getDocumentById(documentId),
  reviewDocument: (documentId: string, comment: string) => apiClient.officialReviewDocument(documentId, comment),
  extractDocument: (documentId: string) => apiClient.extractDocumentInformation(documentId),
};

