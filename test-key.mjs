// Quick test to verify OpenAI API key
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 10));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 10
    });
    console.log('✅ OpenAI API is working!');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI API Error:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
  }
}

testOpenAI();
