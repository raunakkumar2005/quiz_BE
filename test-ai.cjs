// Test script for AI Question Generation with Auth
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

async function testAI() {
  console.log('\n=== AI Question Generation Test ===\n');

  // First, login to get a token
  console.log('Step 1: Login to get token...');
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

  let token = null;
  if (loginRes.data.success && loginRes.data.data?.token) {
    token = loginRes.data.data.token;
    console.log('✅ Logged in successfully!\n');
  } else {
    console.log('❌ Login failed. Trying to register...\n');
    
    // Register a new user
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
    
    if (registerRes.data.success && registerRes.data.data?.token) {
      token = registerRes.data.data.token;
      console.log('✅ Registered and logged in!\n');
    } else {
      console.log('❌ Auth failed:', registerRes.data);
      return;
    }
  }

  // Test AI generation with a unique topic
  const uniqueTopic = `AI_Test_${Date.now()}`;
  console.log('Step 2: Create quiz for topic:', uniqueTopic);
  console.log('This will force AI to generate ALL questions.\n');

  const createRes = await makeRequest({
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
    topic: uniqueTopic,
    difficulty: 'EASY',
    num_questions: 3
  });

  console.log('Status:', createRes.status);
  console.log('Response:', JSON.stringify(createRes.data, null, 2));

  if (createRes.status === 201 && createRes.data.success) {
    console.log('\n✅ Quiz created successfully!');
    console.log('Quiz ID:', createRes.data.data.quiz_id);
    console.log('Total Questions:', createRes.data.data.total_questions);
    console.log('AI Generated:', createRes.data.data.ai_generated);
    
    if (createRes.data.data.ai_generated) {
      console.log('\n🎉 AI Question Generation is WORKING!');
    }
  } else {
    console.log('\n❌ Quiz creation failed');
    if (createRes.data.message?.includes('quota')) {
      console.log('Note: AI quota may be exceeded');
    }
  }

  console.log('\n=== AI Test Completed ===\n');
}

testAI().catch(console.error);
