#!/usr/bin/env node
/**
 * PublicPulse Frontend-Backend Connection Diagnostic
 * This script tests the connection between frontend and backend
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🔍 PublicPulse Connection Diagnostic');
console.log('=====================================');

// Test 1: Backend Health
console.log('\n1️⃣ Testing Backend Health...');
const healthOptions = {
  hostname: 'localhost',
  port: 8000,
  path: '/health',
  method: 'GET'
};

const healthReq = http.request(healthOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const healthData = JSON.parse(data);
      console.log('✅ Backend is running');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   AI Service: ${healthData.ai_service}`);
      console.log(`   Timestamp: ${healthData.timestamp}`);
    } catch (e) {
      console.log('❌ Backend health check failed - invalid JSON response');
    }
  });
});

healthReq.on('error', (err) => {
  console.log('❌ Backend is not running or not accessible');
  console.log(`   Error: ${err.message}`);
});

healthReq.end();

// Test 2: Frontend Accessibility
console.log('\n2️⃣ Testing Frontend Accessibility...');
const frontendOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

const frontendReq = http.request(frontendOptions, (res) => {
  console.log('✅ Frontend is running');
  console.log(`   Status Code: ${res.statusCode}`);
  console.log(`   Content-Type: ${res.headers['content-type']}`);
});

frontendReq.on('error', (err) => {
  console.log('❌ Frontend is not running or not accessible');
  console.log(`   Error: ${err.message}`);
});

frontendReq.end();

// Test 3: CORS Headers
console.log('\n3️⃣ Testing CORS Configuration...');
const corsOptions = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/admin/stats',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Content-Type'
  }
};

const corsReq = http.request(corsOptions, (res) => {
  console.log('✅ CORS preflight successful');
  console.log(`   Status Code: ${res.statusCode}`);
  console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
  console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
});

corsReq.on('error', (err) => {
  console.log('❌ CORS preflight failed');
  console.log(`   Error: ${err.message}`);
});

corsReq.end();

// Test 4: API Endpoints
console.log('\n4️⃣ Testing API Endpoints...');
const apiOptions = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/admin/stats',
  method: 'GET'
};

const apiReq = http.request(apiOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const apiData = JSON.parse(data);
      console.log('✅ API endpoint working');
      console.log(`   Total Users: ${apiData.total_users}`);
      console.log(`   Documents Processed: ${apiData.documents_processed}`);
      console.log(`   AI Processed: ${apiData.ai_processed}`);
    } catch (e) {
      console.log('❌ API endpoint returned invalid JSON');
    }
  });
});

apiReq.on('error', (err) => {
  console.log('❌ API endpoint failed');
  console.log(`   Error: ${err.message}`);
});

apiReq.end();

// Test 5: AI Integration
console.log('\n5️⃣ Testing AI Integration...');
const aiData = JSON.stringify({
  document_type: 'national_id',
  images: ['mock_image_data']
});

const aiOptions = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/ai/test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(aiData)
  }
};

const aiReq = http.request(aiOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const aiResult = JSON.parse(data);
      if (aiResult.success) {
        console.log('✅ AI Integration working');
        console.log(`   Confidence: ${(aiResult.ai_result.ai_confidence * 100).toFixed(1)}%`);
        console.log(`   Quality: ${(aiResult.ai_result.ai_quality_score * 100).toFixed(1)}%`);
        console.log(`   Fraud Risk: ${(aiResult.ai_result.ai_fraud_risk * 100).toFixed(1)}%`);
      } else {
        console.log('❌ AI test failed');
        console.log(`   Message: ${aiResult.message}`);
      }
    } catch (e) {
      console.log('❌ AI endpoint returned invalid JSON');
    }
  });
});

aiReq.on('error', (err) => {
  console.log('❌ AI integration failed');
  console.log(`   Error: ${err.message}`);
});

aiReq.write(aiData);
aiReq.end();

console.log('\n📋 Diagnostic Summary:');
console.log('=====================');
console.log('If all tests show ✅, the connection should be working.');
console.log('If any tests show ❌, there may be configuration issues.');
console.log('\n💡 Next Steps:');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Open browser developer tools (F12)');
console.log('3. Check the Console tab for any JavaScript errors');
console.log('4. Check the Network tab to see if API calls are being made');
console.log('5. Look for any CORS errors or failed requests');
