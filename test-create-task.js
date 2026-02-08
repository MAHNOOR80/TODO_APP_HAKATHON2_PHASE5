const axios = require('axios');

// Create axios instance with cookie jar functionality
const instance = axios.create({
  baseURL: 'http://localhost:5004/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store cookies manually
let cookies = [];

instance.interceptors.response.use(
  response => {
    // Extract cookies from response headers
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      cookies = setCookies;
    }
    return response;
  },
  error => {
    // Extract cookies from error response headers
    if (error.response && error.response.headers['set-cookie']) {
      cookies = error.response.headers['set-cookie'];
    }
    return Promise.reject(error);
  }
);

// Add cookies to outgoing requests
instance.interceptors.request.use(config => {
  if (cookies.length > 0) {
    // Extract the session cookie from the array
    const sessionCookie = cookies.find(cookie => cookie.startsWith('todo_session='));
    if (sessionCookie) {
      // Extract just the cookie name=value part
      const cookieValue = sessionCookie.split(';')[0];
      config.headers.Cookie = cookieValue;
    }
  }
  return config;
});

async function testCreateTask() {
  try {
    console.log('🛒 Testing AI Task Creation...\n');

    // Step 1: Sign in to get session
    console.log('1. Signing in with test user...');
    const signInResponse = await instance.post('/auth/signin', {
      email: 'test@example.com',
      password: 'Password123!'
    });

    console.log('✅ Signed in successfully!');
    console.log('User ID:', signInResponse.data.data.id, '\n');

    // Test various ways to create a task
    const testMessages = [
      "Create a task to buy groceries",
      "Add a task: buy groceries",
      "I need to buy groceries",
      "Make a task to buy groceries",
      "Add task: Buy groceries from the store"
    ];

    for (let i = 0; i < testMessages.length; i++) {
      console.log(`${i + 2}. Testing message: "${testMessages[i]}"`);
      const response = await instance.post('/ai/chat', {
        message: testMessages[i],
        sessionId: 'test-session-123'
      });

      console.log('   Response:', response.data.data?.responseText || 'No response text');
      console.log('   Intent:', response.data.data?.detectedIntent?.type);
      console.log('   Confidence:', response.data.data?.detectedIntent?.confidence);
      console.log('   Parameters:', JSON.stringify(response.data.data?.detectedIntent?.parameters, null, 2));
      console.log('   Action Plan:');
      if (response.data.data?.actionPlan) {
        response.data.data.actionPlan.forEach((plan, idx) => {
          console.log(`     ${idx + 1}. ${plan.operation} -> ${plan.method} ${plan.endpoint}`);
          if (plan.payload) {
            console.log(`        Payload:`, JSON.stringify(plan.payload, null, 2));
          }
        });
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error during task creation test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testCreateTask();