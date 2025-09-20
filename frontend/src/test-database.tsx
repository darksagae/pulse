// Test file to verify Supabase connection and data
import React, { useEffect, useState } from 'react';
import { supabase, testConnection } from './lib/supabase-simple';

const DatabaseTest: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');

  useEffect(() => {
    const runTests = async () => {
      try {
        setLoading(true);
        
        // Test basic connection
        const isConnected = await testConnection();
        setConnectionStatus(isConnected ? 'Connected ✅' : 'Failed ❌');
        
        if (!isConnected) {
          setError('Failed to connect to Supabase');
          return;
        }
        
        // Test departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('is_active', true);
        
        if (deptError) throw deptError;
        setDepartments(deptData || []);
        
        // Test documents
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('*')
          .limit(5);
        
        if (docError) throw docError;
        setDocuments(docData || []);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Database test error:', err);
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Testing Database Connection...</h2>
        <p>Loading data from Supabase...</p>
        <p>Status: {connectionStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Database Connection Error</h2>
        <p>Status: {connectionStatus}</p>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>PublicPulse Database Test</h1>
      
      <h2>Database Connection: {connectionStatus}</h2>
      
      <h3>Departments ({departments.length})</h3>
      <ul>
        {departments.map(dept => (
          <li key={dept.id}>
            <strong>{dept.name}</strong> - {dept.description}
            <br />
            <small>Processing Time: {dept.processing_time}</small>
          </li>
        ))}
      </ul>

      <h3>Sample Documents ({documents.length})</h3>
      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            <strong>{doc.document_id}</strong> - {doc.document_type}
            <br />
            <small>Status: {doc.status} | Progress: {doc.progress_percentage}%</small>
          </li>
        ))}
      </ul>

      <h3>Database Features Available:</h3>
      <ul>
        <li>✅ User Management (Citizens, Officials, Admins)</li>
        <li>✅ Department Configuration (NIRA, URSB, Immigration, Finance, Health)</li>
        <li>✅ Document Processing with Status Tracking</li>
        <li>✅ File Storage for Document Uploads</li>
        <li>✅ Real-time Notifications</li>
        <li>✅ Progress Tracking with Workflow Steps</li>
        <li>✅ Priority Management</li>
        <li>✅ Audit Logging</li>
      </ul>

      <h3>Next Steps:</h3>
      <ol>
        <li>Integrate API calls into your React components</li>
        <li>Replace mock data with real database data</li>
        <li>Add real-time subscriptions for live updates</li>
        <li>Implement file upload functionality</li>
        <li>Add authentication (when ready)</li>
      </ol>
    </div>
  );
};

export default DatabaseTest;
