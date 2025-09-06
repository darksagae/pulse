// Test Supabase import with different approaches
import React, { useEffect, useState } from 'react';

const TestSupabase: React.FC = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testImport = async () => {
      try {
        // Try dynamic import
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabaseUrl = 'https://fqhulfipcitbfyhwypos.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaHVsZmlwY2l0YmZ5aHd5cG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjQwNTksImV4cCI6MjA3MjcwMDA1OX0.8LDzhBRJ-CUzIAUImY9XX2pNBm571bkf-0DoaJSGxC4';
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Test connection
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .limit(1);
        
        if (error) {
          setError(`Database error: ${error.message}`);
          setStatus('Failed ❌');
        } else {
          setStatus('Success ✅');
          console.log('Supabase data:', data);
        }
      } catch (err) {
        setError(`Import error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setStatus('Failed ❌');
        console.error('Import error:', err);
      }
    };

    testImport();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Import Test</h1>
      <h2>Status: {status}</h2>
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <h3>Test Results:</h3>
        <ul>
          <li>Dynamic import: {status.includes('Success') ? '✅ Working' : '❌ Failed'}</li>
          <li>Database connection: {status.includes('Success') ? '✅ Working' : '❌ Failed'}</li>
        </ul>
      </div>
    </div>
  );
};

export default TestSupabase;
