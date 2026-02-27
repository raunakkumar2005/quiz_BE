// Test script for Quiz API with Auth
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

async function testAPI() {
  console.log('\n=== Quiz API Tests ===\n');

  // First, login to get token
  console.log('Step 1: Login...');
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
    console.log('✅ Logged in!\n');
  } else {
    console.log('❌ Login failed\n');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: Health Check
  console.log('Test 1: Health Check');
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  });
  console.log('Status:', healthRes.status);
  if (healthRes.status === 200) {
    console.log('✅ Health check passed\n');
  }

  // Test 2: Create Quiz (using existing questions in DB)
  console.log('Test 2: Create Quiz');
  const createRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/quizzes',
    method: 'POST',
    headers: authHeaders
  }, {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'EASY',
    num_questions: 2
  });
  console.log('Status:', createRes.status);
  if (createRes.status === 201 && createRes.data.success) {
    console.log('✅ Quiz created! ID:', createRes.data.data.quiz_id, '\n');
  } else {
    console.log('❌ Quiz creation failed\n');
    return;
  }
  const quizId = createRes.data.data.quiz_id;

  // Test 3: Get Quiz Questions
  console.log('Test 3: Get Quiz Questions');
  const questionsRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/quizzes/${quizId}/questions`,
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', questionsRes.status);
  if (questionsRes.status === 200) {
    console.log('✅ Questions fetched!\n');
  }

  // Test 4: Submit Quiz
  console.log('Test 4: Submit Quiz');
  const questionIds = questionsRes.data.data.questions.map(q => q._id);
  const submitRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/quizzes/${quizId}/submit`,
    method: 'POST',
    headers: authHeaders
  }, {
    answers: [
      { question_id: questionIds[0], selected_option: 'A' },
      { question_id: questionIds[1], selected_option: 'A' }
    ]
  });
  console.log('Status:', submitRes.status);
  if (submitRes.status === 200) {
    console.log('✅ Quiz submitted! Score:', submitRes.data.data.score_percentage, '%\n');
  } else {
    console.log('❌ Submit failed:', submitRes.data.message, '\n');
  }

  // Test 5: Get Quiz Result
  console.log('Test 5: Get Quiz Result');
  const resultRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/quizzes/${quizId}/result`,
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', resultRes.status);
  if (resultRes.status === 200) {
    console.log('✅ Result fetched!\n');
  }

  // Test 6: Validation Error
  console.log('Test 6: Validation Error');
  const validationRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/quizzes',
    method: 'POST',
    headers: authHeaders
  }, {});
  console.log('Status:', validationRes.status);
  if (validationRes.status === 400) {
    console.log('✅ Validation error handled!\n');
  }

  console.log('=== All Tests Completed ===\n');
}

testAPI().catch(console.error);
