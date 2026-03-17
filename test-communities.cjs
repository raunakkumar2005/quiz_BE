#!/usr/bin/env node

/**
 * Test script for the Communities module
 * Run with: node test-communities.cjs
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testCommunity = {
  name: 'GATE2026-' + Date.now(),
  description: 'Community for GATE 2026 aspirants',
  exam: 'GATE',
  rules: ['Be respectful', 'No spam', 'Stay on topic']
};

const testPost = {
  title: 'Best preparation strategy for GATE 2026?',
  content: 'I\'m starting my GATE 2026 preparation. What\'s the best strategy to follow?',
  post_type: 'question',
  tags: ['GATE', 'preparation', 'strategy']
};

const testComment = {
  content: 'Start with understanding the syllabus and previous year papers!'
};

let authToken = '';
let createdCommunity = null;
let createdPost = null;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, url, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { response, result };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { error };
  }
}

async function testAuth() {
  console.log('🧪 Testing Authentication...');
  
  // Try to register user (may already exist)
  const { response: registerRes, result: registerResult } = await makeRequest(
    'POST', 
    `${API_BASE}/auth/register`, 
    testUser
  );
  
  if (registerRes.status === 201) {
    console.log('✅ User registration successful');
  } else {
    console.log('ℹ️  User already exists, proceeding with login');
  }

  // Login user
  const { response: loginRes, result: loginResult } = await makeRequest(
    'POST', 
    `${API_BASE}/auth/login`, 
    { email: testUser.email, password: testUser.password }
  );
  
  if (loginRes.status === 200) {
    authToken = loginResult.data.token;
    console.log('✅ User login successful');
    return true;
  } else {
    console.log('❌ User login failed:', loginResult.message);
    return false;
  }
}

async function testCommunityCreation() {
  console.log('\n🧪 Testing Community Creation...');
  
  const { response, result } = await makeRequest(
    'POST', 
    `${API_BASE}/communities`, 
    testCommunity, 
    authToken
  );
  
  if (response.status === 201) {
    createdCommunity = result.data;
    console.log('✅ Community created successfully:', createdCommunity.name);
    return true;
  } else {
    console.log('❌ Community creation failed:', result.message);
    return false;
  }
}

async function testCommunityJoin() {
  console.log('\n🧪 Testing Community Join...');
  
  const { response, result } = await makeRequest(
    'POST', 
    `${API_BASE}/communities/${testCommunity.name}/join`, 
    null, 
    authToken
  );
  
  if (response.status === 200) {
    console.log('✅ Successfully joined community');
    return true;
  } else if (result.message === 'You are already a member of this community') {
    console.log('ℹ️  Already a member of community');
    return true;
  } else {
    console.log('❌ Community join failed:', result.message);
    return false;
  }
}

async function testPostCreation() {
  console.log('\n🧪 Testing Post Creation...');
  
  const postData = {
    ...testPost,
    communityName: testCommunity.name
  };
  
  const { response, result } = await makeRequest(
    'POST', 
    `${API_BASE}/posts`, 
    postData, 
    authToken
  );
  
  if (response.status === 201) {
    createdPost = result.data;
    console.log('✅ Post created successfully:', createdPost.title);
    return true;
  } else {
    console.log('❌ Post creation failed:', result.message);
    return false;
  }
}

async function testCommentCreation() {
  console.log('\n🧪 Testing Comment Creation...');
  
  const { response, result } = await makeRequest(
    'POST', 
    `${API_BASE}/comments/posts/${createdPost._id}/comments`, 
    testComment, 
    authToken
  );
  
  if (response.status === 201) {
    console.log('✅ Comment created successfully');
    return true;
  } else {
    console.log('❌ Comment creation failed:', result.message);
    return false;
  }
}

async function testVoting() {
  console.log('\n🧪 Testing Voting System...');
  
  // Upvote post
  const { response: upvoteRes, result: upvoteResult } = await makeRequest(
    'POST', 
    `${API_BASE}/posts/${createdPost._id}/vote`, 
    { voteType: 'upvote' }, 
    authToken
  );
  
  if (upvoteRes.status === 200) {
    console.log('✅ Post upvoted successfully');
  } else {
    console.log('❌ Post upvote failed:', upvoteResult.message);
  }

  // Create a comment first for voting test
  const { response: commentRes, result: commentResult } = await makeRequest(
    'POST', 
    `${API_BASE}/comments/posts/${createdPost._id}/comments`, 
    testComment, 
    authToken
  );
  
  if (commentRes.status === 201) {
    // Downvote comment
    const { response: downvoteRes, result: downvoteResult } = await makeRequest(
      'POST', 
      `${API_BASE}/comments/${commentResult.data._id}/vote`, 
      { voteType: 'downvote' }, 
      authToken
    );
    
    if (downvoteRes.status === 200) {
      console.log('✅ Comment downvoted successfully');
    } else {
      console.log('❌ Comment downvote failed:', downvoteResult.message);
    }
  } else {
    console.log('❌ Could not create comment for voting test:', commentResult.message);
  }
}

async function testFeed() {
  console.log('\n🧪 Testing Feed Functionality...');
  
  const { response, result } = await makeRequest(
    'GET', 
    `${API_BASE}/feed`, 
    null, 
    authToken
  );
  
  if (response.status === 200) {
    console.log('✅ Feed retrieved successfully');
    console.log(`   Posts in feed: ${result.data.posts.length}`);
  } else {
    console.log('❌ Feed retrieval failed:', result.message);
  }
}

async function testTrending() {
  console.log('\n🧪 Testing Trending Posts...');
  
  const { response, result } = await makeRequest(
    'GET', 
    `${API_BASE}/trending`, 
    null, 
    authToken
  );
  
  if (response.status === 200) {
    console.log('✅ Trending posts retrieved successfully');
    console.log(`   Trending posts: ${result.data.length}`);
  } else {
    console.log('❌ Trending posts retrieval failed:', result.message);
  }
}

async function testCommunityPosts() {
  console.log('\n🧪 Testing Community Posts...');
  
  const { response, result } = await makeRequest(
    'GET', 
    `${API_BASE}/communities/${testCommunity.name}/posts`, 
    null, 
    authToken
  );
  
  if (response.status === 200) {
    console.log('✅ Community posts retrieved successfully');
    console.log(`   Posts in community: ${result.data.posts.length}`);
  } else {
    console.log('❌ Community posts retrieval failed:', result.message);
  }
}

async function testModeration() {
  console.log('\n🧪 Testing Moderation Capabilities...');
  
  // Test pinning post (only creator/moderator can do this)
  const { response: pinRes, result: pinResult } = await makeRequest(
    'POST', 
    `${API_BASE}/posts/${createdPost._id}/pin`, 
    null, 
    authToken
  );
  
  if (pinRes.status === 200) {
    console.log('✅ Post pinned successfully');
  } else {
    console.log('❌ Post pin failed:', pinResult.message);
  }

  // Test locking post
  const { response: lockRes, result: lockResult } = await makeRequest(
    'POST', 
    `${API_BASE}/posts/${createdPost._id}/lock`, 
    null, 
    authToken
  );
  
  if (lockRes.status === 200) {
    console.log('✅ Post locked successfully');
  } else {
    console.log('❌ Post lock failed:', lockResult.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Communities Module Tests\n');
  console.log('=====================================\n');

  try {
    // Wait for server to be ready
    await delay(2000);

    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log('\n❌ Authentication failed. Cannot proceed with tests.');
      return;
    }

    await testCommunityCreation();
    await testCommunityJoin();
    await testPostCreation();
    await testCommentCreation();
    await testVoting();
    await testFeed();
    await testTrending();
    await testCommunityPosts();
    await testModeration();

    console.log('\n=====================================');
    console.log('🎉 All tests completed!');
    console.log('💡 Note: Some tests may fail if the server is not running or if there are validation errors.');
    console.log('💡 Make sure MongoDB is running and the server is started with: npm run dev');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

// Run tests if this file is executed directly
runTests();
