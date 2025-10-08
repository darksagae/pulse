// Enhanced API service for complete document workflow
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://publicpulse-backend.onrender.com';

// Types for enhanced API
export interface EnhancedDocument {
  id: string;
  citizen_id: string;
  department_id: string;
  document_type: string;
  status: 'pending' | 'ai_processed' | 'official_review' | 'admin_review' | 'completed' | 'rejected';
  current_stage: string;
  priority: string;
  ai_confidence?: number;
  ai_quality_score?: number;
  ai_fraud_risk?: number;
  ai_processing_time?: string;
  ai_extracted_fields?: Record<string, string>;
  ai_recommendations?: string[];
  ai_issues?: string[];
  official_review_comment?: string;
  admin_review_comment?: string;
  assigned_official_id?: string;
  created_at: string;
  updated_at: string;
  stages?: DocumentStage[];
  reviews?: DocumentReview[];
  files?: DocumentFile[];
}

export interface DocumentStage {
  id: string;
  stage_name: string;
  stage_data: any;
  processed_by: string;
  started_at: string;
  completed_at?: string;
  notes?: string;
}

export interface DocumentReview {
  id: string;
  reviewer_id: string;
  review_type: 'official' | 'admin';
  review_data: any;
  decision: 'approve' | 'reject' | 'needs_resubmission';
  comments: string;
  corrections: string[];
  verification_notes?: string;
  reviewed_fields: string[];
  created_at: string;
}

export interface DocumentFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_primary: boolean;
  uploaded_at: string;
  signed_url?: string;
}

export interface OfficialReviewRequest {
  decision: 'approve' | 'reject' | 'needs_resubmission';
  comments: string;
  verification_notes?: string;
  reviewed_fields?: string[];
  corrections?: string[];
  quality_assessment?: string;
  compliance_check?: string;
}

export interface AdminReviewRequest {
  decision: 'approve' | 'reject' | 'reassign';
  comments: string;
  admin_notes?: string;
  compliance_verification?: string;
  quality_assessment?: string;
  system_verification?: string;
  corrections?: string[];
  verification_notes?: string;
  reviewed_fields?: string[];
}

export interface DocumentStats {
  total_documents: number;
  pending: number;
  ai_processed: number;
  official_review: number;
  admin_review: number;
  completed: number;
  rejected: number;
  completed_today?: number;
}

// Enhanced API Client
class EnhancedAPIClient {
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
      headers['Authorization'] = `Bearer ${this.token}`;
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

  // Enhanced Document Processing
  async processDocument(request: {
    citizen_id: string;
    document_type: string;
    department_id: string;
    images: string[];
  }): Promise<{
    document: EnhancedDocument;
    ai_result: any;
    notification: any;
    assigned_official?: any;
  }> {
    return this.request('/documents/process', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Get document with all details
  async getDocument(documentId: string): Promise<{
    document: EnhancedDocument;
    files: DocumentFile[];
  }> {
    return this.request(`/documents/${documentId}`);
  }

  // Get documents with filters
  async getDocuments(filters: {
    status_filter?: string;
    department_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    documents: EnhancedDocument[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    if (filters.status_filter) params.append('status_filter', filters.status_filter);
    if (filters.department_id) params.append('department_id', filters.department_id);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    return this.request(`/documents?${params.toString()}`);
  }

  // Official Review Operations
  async getDocumentsForReview(): Promise<{
    documents: EnhancedDocument[];
    total: number;
    limit: number;
    offset: number;
  }> {
    return this.request('/official-review/documents');
  }

  async getDocumentForReview(documentId: string): Promise<{
    document: EnhancedDocument;
    images: DocumentFile[];
    ai_extraction: Record<string, string>;
    ai_confidence: number;
    ai_quality_score: number;
    ai_fraud_risk: number;
    ai_recommendations: string[];
    ai_issues: string[];
  }> {
    return this.request(`/official-review/documents/${documentId}`);
  }

  async submitOfficialReview(documentId: string, review: OfficialReviewRequest): Promise<{
    message: string;
    review: DocumentReview;
    document: EnhancedDocument;
    next_status: string;
  }> {
    return this.request(`/official-review/documents/${documentId}/review`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }

  async getOfficialDashboardStats(): Promise<{
    department_stats: DocumentStats;
    personal_stats: any;
    official_id: string;
    department_id: string;
  }> {
    return this.request('/official-review/stats/dashboard');
  }

  // Admin Review Operations
  async getDocumentsForAdminReview(): Promise<{
    documents: EnhancedDocument[];
    total: number;
    limit: number;
    offset: number;
  }> {
    return this.request('/admin-review/documents');
  }

  async getDocumentForAdminReview(documentId: string): Promise<{
    document: EnhancedDocument;
    images: DocumentFile[];
    ai_extraction: Record<string, string>;
    ai_confidence: number;
    ai_quality_score: number;
    ai_fraud_risk: number;
    ai_recommendations: string[];
    ai_issues: string[];
    official_review: string;
    stages: DocumentStage[];
    reviews: DocumentReview[];
  }> {
    return this.request(`/admin-review/documents/${documentId}`);
  }

  async submitAdminFinalDecision(documentId: string, decision: AdminReviewRequest): Promise<{
    message: string;
    review: DocumentReview;
    document: EnhancedDocument;
    final_status: string;
  }> {
    return this.request(`/admin-review/documents/${documentId}/final-decision`, {
      method: 'POST',
      body: JSON.stringify(decision)
    });
  }

  async getSystemOverviewStats(): Promise<{
    system_stats: DocumentStats;
    department_stats: any[];
    ai_metrics: any;
    user_stats: any;
    generated_at: string;
  }> {
    return this.request('/admin-review/stats/system-overview');
  }

  async reassignDocument(documentId: string, reassignData: {
    new_official_id?: string;
    new_department_id?: string;
    reason: string;
  }): Promise<{
    message: string;
    document: EnhancedDocument;
  }> {
    return this.request(`/admin-review/documents/${documentId}/reassign`, {
      method: 'POST',
      body: JSON.stringify(reassignData)
    });
  }

  // Document Assignment
  async assignDocument(documentId: string, officialId: string): Promise<{
    message: string;
    document: EnhancedDocument;
  }> {
    return this.request(`/documents/${documentId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ official_id: officialId })
    });
  }

  // Statistics
  async getDocumentStats(): Promise<DocumentStats> {
    return this.request('/documents/stats/overview');
  }

  // Audit Logs
  async getAuditLogs(filters: {
    limit?: number;
    offset?: number;
    action_filter?: string;
    user_id_filter?: string;
  } = {}): Promise<{
    audit_logs: any[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.action_filter) params.append('action_filter', filters.action_filter);
    if (filters.user_id_filter) params.append('user_id_filter', filters.user_id_filter);

    return this.request(`/admin-review/audit-logs?${params.toString()}`);
  }
}

// Export enhanced API client
export const enhancedAPI = new EnhancedAPIClient(API_BASE_URL);
