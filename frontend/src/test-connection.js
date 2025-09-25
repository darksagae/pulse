// Test script to verify frontend-backend connection
const API_BASE_URL = 'http://localhost:8000';

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test admin stats
    console.log('2️⃣ Testing admin stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/admin/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Admin stats:', statsData);
    
    // Test document submission
    console.log('3️⃣ Testing document submission...');
    const submitResponse = await fetch(`${API_BASE_URL}/api/documents/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_type: 'test', user_id: 'test_user' })
    });
    const submitData = await submitResponse.json();
    console.log('✅ Document submission:', submitData);
    
    // Test AI integration
    console.log('4️⃣ Testing AI integration...');
    const aiResponse = await fetch(`${API_BASE_URL}/api/ai/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_type: 'national_id', images: ['mock'] })
    });
    const aiData = await aiResponse.json();
    console.log('✅ AI test:', aiData);
    
    console.log('🎉 All tests passed! Frontend can connect to backend.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.log('💡 Make sure the backend is running on port 8000');
  }
}

// Run the test
testConnection();
