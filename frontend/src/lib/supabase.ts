// Supabase configuration and API functions
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fqhulfipcitbfyhwypos.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaHVsZmlwY2l0YmZ5aHd5cG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjQwNTksImV4cCI6MjA3MjcwMDA1OX0.8LDzhBRJ-CUzIAUImY9XX2pNBm571bkf-0DoaJSGxC4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  national_id?: string
  user_type: 'citizen' | 'official' | 'admin'
  department_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  description?: string
  color?: string
  workflow_steps: string[]
  document_types: string[]
  processing_time: string
  requirements: string[]
  is_active: boolean
  created_at: string
}

export interface Document {
  id: string
  document_id: string
  user_id: string
  department_id: string
  document_type: string
  title: string
  description?: string
  status: 'Submitted' | 'Under Review' | 'Under Verification' | 'Payment Pending' | 'Biometrics Pending' | 'Approved' | 'Rejected' | 'Completed'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  current_step: number
  total_steps: number
  progress_percentage: number
  submitted_at: string
  estimated_completion?: string
  completed_at?: string
  assigned_official_id?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  document_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
}

// API Functions
export class PublicPulseAPI {
  // Get all departments
  static async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }

  // Get user dashboard data
  static async getUserDashboard(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_dashboard', { user_uuid: userId })
    
    if (error) throw error
    return data
  }

  // Get department dashboard data
  static async getDepartmentDashboard(departmentId: string) {
    const { data, error } = await supabase
      .rpc('get_department_dashboard', { dept_id: departmentId })
    
    if (error) throw error
    return data
  }

  // Get user documents
  static async getUserDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        departments(name, color),
        users!documents_assigned_official_id_fkey(full_name)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Get department documents
  static async getDepartmentDocuments(departmentId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        users!documents_user_id_fkey(full_name, email, phone)
      `)
      .eq('department_id', departmentId)
      .order('submitted_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Get user notifications
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    return data || []
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    
    if (error) throw error
  }

  // Update document status
  static async updateDocumentStatus(documentId: string, status: string, assignedOfficialId?: string) {
    const { error } = await supabase
      .from('documents')
      .update({ 
        status,
        assigned_official_id: assignedOfficialId,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
    
    if (error) throw error
  }

  // Upload document file
  static async uploadDocumentFile(userId: string, documentId: string, file: File) {
    const filePath = `${userId}/${documentId}/${file.name}`
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file)
    
    if (error) throw error
    
    // Save file record to database
    const { error: dbError } = await supabase
      .from('document_files')
      .insert({
        document_id: documentId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        is_primary: true
      })
    
    if (dbError) throw dbError
    
    return data
  }

  // Get document files
  static async getDocumentFiles(documentId: string) {
    const { data, error } = await supabase
      .from('document_files')
      .select('*')
      .eq('document_id', documentId)
      .order('uploaded_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Subscribe to real-time updates
  static subscribeToDocumentUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('document_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }

  static subscribeToNotificationUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notification_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }
}

export default PublicPulseAPI
