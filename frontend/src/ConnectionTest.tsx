import React, { useState, useEffect } from 'react';

const ConnectionTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info', details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = details ? `${message} - ${details}` : message;
    setResults(prev => [...prev, `[${timestamp}] ${type.toUpperCase()}: ${fullMessage}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);
    addResult('Starting connection test...', 'info');

    try {
      // Test 1: Basic health check
      addResult('Testing backend health...', 'info');
      const healthResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/health`);
      const healthData = await healthResponse.json();
      
      if (healthResponse.ok) {
        addResult(`Backend is running! Status: ${healthData.status}`, 'success');
      } else {
        addResult(`Backend health check failed: ${healthResponse.status}`, 'error');
      }

      // Test 2: Admin stats
      addResult('Testing admin stats API...', 'info');
      const statsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/stats`);
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        addResult(`Admin stats loaded: ${statsData.total_users} users, ${statsData.documents_processed} documents`, 'success');
      } else {
        addResult(`Admin stats failed: ${statsResponse.status}`, 'error');
      }

      // Test 3: Document submission
      addResult('Testing document submission...', 'info');
      const submitResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/documents/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'test_document',
          user_id: 'test_user_123',
          department_id: 'test_dept'
        })
      });
      const submitData = await submitResponse.json();
      
      if (submitResponse.ok && submitData.success) {
        addResult(`Document submitted successfully! ID: ${submitData.document_id}`, 'success');
      } else {
        addResult(`Document submission failed: ${submitData.message || 'Unknown error'}`, 'error');
      }

      // Test 4: AI integration
      addResult('Testing AI integration...', 'info');
      const aiResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/ai/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'national_id',
          images: ['mock_image_data']
        })
      });
      const aiData = await aiResponse.json();
      
      if (aiResponse.ok && aiData.success) {
        const aiResult = aiData.ai_result;
        addResult(`AI test successful! Confidence: ${(aiResult.ai_confidence * 100).toFixed(1)}%, Quality: ${(aiResult.ai_quality_score * 100).toFixed(1)}%`, 'success');
      } else {
        addResult(`AI test failed: ${aiData.message || 'Unknown error'}`, 'error');
      }

      addResult('All tests completed!', 'success');

    } catch (error) {
      addResult(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
      <h2>🔗 Frontend-Backend Connection Test</h2>
      <p>This component tests the connection between the React frontend and FastAPI backend.</p>
      
      <button 
        onClick={testConnection}
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
        {isLoading ? 'Testing...' : 'Run Connection Test'}
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
        <p><strong>Expected Results:</strong></p>
        <ul>
          <li>✅ Backend is running</li>
          <li>✅ Admin stats loaded</li>
          <li>✅ Document submitted successfully</li>
          <li>✅ AI test successful</li>
        </ul>
        <p>If you see any ❌ errors, there may be a configuration issue.</p>
      </div>
    </div>
  );
};

export default ConnectionTest;
