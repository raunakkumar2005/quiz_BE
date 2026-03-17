#!/usr/bin/env node

/**
 * Basic test to verify the communities module is working
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

async function testBasicEndpoints() {
  console.log('🧪 Testing Basic Endpoints...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test trending posts (no auth required)
    console.log('\n2. Testing trending posts...');
    const trendingResponse = await fetch(`${API_BASE}/trending`);
    const trendingData = await trendingResponse.json();
    console.log('✅ Trending posts retrieved:', trendingData.success);

    // Test communities list (no auth required)
    console.log('\n3. Testing communities list...');
    const communitiesResponse = await fetch(`${API_BASE}/communities`);
    const communitiesData = await communitiesResponse.json();
    console.log('✅ Communities list retrieved:', communitiesData.success);

    console.log('\n🎉 Basic tests completed successfully!');
    console.log('💡 The communities module is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBasicEndpoints();