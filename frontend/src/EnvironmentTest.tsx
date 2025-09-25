import React from 'react';

const EnvironmentTest: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔧 Environment Configuration Test</h2>
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        padding: '15px',
        margin: '10px 0'
      }}>
        <h3>Environment Variables:</h3>
        <p><strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL || 'Not set (using default)'}</p>
        <p><strong>Final API URL:</strong> {apiUrl}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      </div>
      
      <div style={{
        backgroundColor: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '5px',
        padding: '15px',
        margin: '10px 0'
      }}>
        <h3>Expected Configuration:</h3>
        <ul>
          <li>✅ REACT_APP_API_URL should be: <code>http://localhost:8000</code></li>
          <li>✅ Final API URL should be: <code>http://localhost:8000</code></li>
          <li>❌ If you see "Not set (using default)", the environment variable is not loaded</li>
        </ul>
      </div>
      
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '5px',
        padding: '15px',
        margin: '10px 0'
      }}>
        <h3>If Environment Variable is Not Set:</h3>
        <p>This means the frontend is not reading the environment variable properly. The issue could be:</p>
        <ul>
          <li>Environment variable not set when starting the app</li>
          <li>React app not reloading after environment changes</li>
          <li>Configuration file override (like netlify.toml)</li>
        </ul>
      </div>
    </div>
  );
};

export default EnvironmentTest;
