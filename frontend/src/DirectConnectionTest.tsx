import React, { useState } from 'react';

const DirectConnectionTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info', details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = details ? `${message} - ${details}` : message;
    setResults(prev => [...prev, `[${timestamp}] ${type.toUpperCase()}: ${fullMessage}`]);
  };

  const testDirectConnection = async () => {
    setIsLoading(true);
    setResults([]);
    addResult('Starting direct connection test...', 'info');

    try {
      // Test 1: Direct fetch to localhost
      addResult('Testing direct fetch to localhost:8000...', 'info');
      const directResponse = await fetch('http://localhost:8000/health');
      const directData = await directResponse.json();
      
      if (directResponse.ok) {
        addResult(`✅ Direct connection successful!`, 'success', `Status: ${directData.status}, AI Service: ${directData.ai_service}`);
      } else {
        addResult(`❌ Direct connection failed`, 'error', `Status: ${directResponse.status}`);
      }

      // Test 2: Using environment variable
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      addResult(`Testing with environment variable: ${apiUrl}`, 'info');
      
      const envResponse = await fetch(`${apiUrl}/health`);
      const envData = await envResponse.json();
      
      if (envResponse.ok) {
        addResult(`✅ Environment variable connection successful!`, 'success', `Status: ${envData.status}`);
      } else {
        addResult(`❌ Environment variable connection failed`, 'error', `Status: ${envResponse.status}`);
      }

      // Test 3: Test API endpoints
      addResult('Testing API endpoints...', 'info');
      const statsResponse = await fetch(`${apiUrl}/api/admin/stats`);
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        addResult(`✅ API endpoints working!`, 'success', `Total users: ${statsData.total_users}, Documents: ${statsData.documents_processed}`);
      } else {
        addResult(`❌ API endpoints failed`, 'error', `Status: ${statsResponse.status}`);
      }

      addResult('Direct connection test completed!', 'success');

    } catch (error) {
      addResult(`❌ Direct connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔗 Direct Connection Test</h2>
      <p>This test bypasses the API client and directly tests the connection to the backend.</p>
      
      <button 
        onClick={testDirectConnection}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Testing...' : 'Run Direct Connection Test'}
      </button>

      {results.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '15px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3>Test Results:</h3>
          {results.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '5px 0',
                borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            >
              {result}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>This test helps identify:</strong></p>
        <ul>
          <li>✅ If the backend is reachable from the browser</li>
          <li>✅ If environment variables are loaded correctly</li>
          <li>✅ If API endpoints are working</li>
          <li>❌ If there are CORS issues</li>
          <li>❌ If there are network connectivity problems</li>
        </ul>
      </div>
    </div>
  );
};

export default DirectConnectionTest;
