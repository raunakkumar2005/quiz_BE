// Test script for Authentication
const http = require('http');

const makeRequest = (options, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function testAuth() {
  console.log('\n=== Authentication Tests ===\n');

  // Test 1: Try to register a new user (may fail if already exists)
  console.log('Test 1: Register User');
  const registerRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  console.log('Status:', registerRes.status);

  let token = null;
  if (registerRes.data.success && registerRes.data.data?.token) {
    token = registerRes.data.data.token;
    console.log('✅ User registered successfully!\n');
  } else if (registerRes.data.message?.includes('already registered')) {
    console.log('User already exists, trying login...\n');
    
    // Login instead
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginRes.data.success && loginRes.data.data?.token) {
      token = loginRes.data.data.token;
      console.log('✅ Login successful!\n');
    }
  } else {
    console.log('❌ Registration failed:', registerRes.data.message, '\n');
  }

  if (!token) return;

  // Test 2: Login with existing user
  console.log('Test 2: Login');
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'test@example.com',
    password: 'password123'
  });
  console.log('Status:', loginRes.status);
  if (loginRes.data.success) {
    console.log('✅ Login successful!\n');
    token = loginRes.data.data.token;
  } else {
    console.log('❌ Login failed\n');
  }

  // Test 3: Access protected route without token
  console.log('Test 3: Access Protected Route (No Token)');
  const noTokenRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/quizzes',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'EASY',
    num_questions: 5
  });
  console.log('Status:', noTokenRes.status);
  if (noTokenRes.status === 401) {
    console.log('✅ Correctly rejected - no token provided\n');
  }

  // Test 4: Access protected route WITH token
  console.log('Test 4: Access Protected Route (With Token)');
  const withTokenRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/quizzes',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'EASY',
    num_questions: 5
  });
  console.log('Status:', withTokenRes.status);
  if (withTokenRes.status === 201) {
    console.log('✅ Successfully accessed protected route!\n');
  }

  console.log('=== Auth Tests Completed ===\n');
}

testAuth().catch(console.error);
