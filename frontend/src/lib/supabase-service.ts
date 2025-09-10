// Supabase Service for Document Processing
import { supabase } from './supabase-simple';

export interface DocumentData {
  id?: string;
  user_id: string;
  document_type: string;
  department_id: string;
  // Match DB enum-like strings
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

// Document Management Functions
export const saveDocument = async (documentData: Omit<DocumentData, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentData> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

export const getDocument = async (documentId: string): Promise<DocumentData | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

export const getUserDocuments = async (citizenId: string): Promise<DocumentData[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', citizenId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return [];
  }
};

export const updateDocumentStatus = async (documentId: string, status: string, updates?: Partial<DocumentData>): Promise<void> => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...updates
    };

    const { error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

// File Storage Functions
export const uploadDocumentImages = async (images: string[], documentId: string): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      const base64Data = imageData.split(',')[1];
      const fileName = `${documentId}/image_${i + 1}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, base64Data, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Notification Functions
export const createNotification = async (notificationData: Omit<NotificationData, 'id' | 'created_at'>): Promise<NotificationData> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Department Functions
export const getDepartments = async () => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Real-time Subscriptions
export const subscribeToDocumentUpdates = (documentId: string, callback: (document: DocumentData) => void) => {
  return supabase
    .channel(`document-${documentId}`)
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'documents',
        filter: `id=eq.${documentId}`
      }, 
      (payload) => {
        callback(payload.new as DocumentData);
      }
    )
    .subscribe();
};

export const subscribeToUserNotifications = (userId: string, callback: (notification: NotificationData) => void) => {
  return supabase
    .channel(`notifications-${userId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      (payload) => {
        callback(payload.new as NotificationData);
      }
    )
    .subscribe();
};

// Document Processing Workflow
export const processDocumentWorkflow = async (documentData: DocumentData, aiResults: any) => {
  try {
    // 1. Save document with AI results
    const savedDocument = await saveDocument({
      ...documentData,
      status: 'ai_processed',
      ai_confidence: aiResults.confidence,
      ai_quality_score: aiResults.qualityScore,
      ai_fraud_risk: aiResults.fraudRisk,
      ai_processing_time: aiResults.processingTime,
      ai_extracted_fields: aiResults.extractedFields,
      ai_recommendations: aiResults.recommendations,
      ai_issues: aiResults.issues
    });

    // 2. Upload images to storage
    const imageUrls = await uploadDocumentImages(documentData.images, savedDocument.id!);

    // 3. Update document with image URLs
    await updateDocumentStatus(savedDocument.id!, 'ai_processed', {
      images: imageUrls
    });

    // 4. Create notification for user
    await createNotification({
      user_id: documentData.user_id,
      document_id: savedDocument.id!,
      title: 'Document Processed',
      message: `Your ${documentData.document_type} has been processed by AI with ${Math.round(aiResults.confidence * 100)}% confidence.`,
      type: 'success',
      read: false
    });

    // 5. Determine department and assign to official
    const departmentId = determineDepartment(documentData.document_type);
    await assignToOfficial(savedDocument.id!, departmentId);

    return savedDocument;
  } catch (error) {
    console.error('Error in document workflow:', error);
    throw error;
  }
};

// Helper Functions
const determineDepartment = (documentType: string): string => {
  const departmentMap: { [key: string]: string } = {
    'National ID Application': 'nira',
    'Vehicle Registration': 'ursb',
    'Passport Application': 'immigration',
    'Tax Return': 'finance',
    'Health Certificate': 'health'
  };
  
  return departmentMap[documentType] || 'general';
};

const assignToOfficial = async (documentId: string, departmentId: string) => {
  try {
    // Get available officials for the department
    const { data: officials } = await supabase
      .from('users')
      .select('id')
      .eq('department_id', departmentId)
      .eq('user_type', 'official')
      .eq('is_active', true);

    if (officials && officials.length > 0) {
      // Assign to first available official (simple round-robin)
      const assignedOfficial = officials[0];
      
      // Update document with assigned official
      await supabase
        .from('documents')
        .update({ 
          assigned_official_id: assignedOfficial.id,
          status: 'Under Review'
        })
        .eq('id', documentId);

      // Create notification for official
      await createNotification({
        user_id: assignedOfficial.id,
        document_id: documentId,
        title: 'New Document Assigned',
        message: 'A new document has been assigned to you for review.',
        type: 'info',
        read: false
      });
    }
  } catch (error) {
    console.error('Error assigning to official:', error);
  }
};

// Analytics Functions
export const getDocumentStats = async () => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('status, ai_confidence, ai_quality_score, created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return [];
  }
};

export const getAIPerformanceMetrics = async () => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('ai_confidence, ai_quality_score, ai_processing_time, created_at')
      .not('ai_confidence', 'is', null);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching AI metrics:', error);
    return [];
  }
};
