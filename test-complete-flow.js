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

async function testCompleteFlow() {
  try {
    console.log('🔄 Testing Complete AI Chatbot Flow...\n');

    // Step 1: Sign in to get session
    console.log('1. Signing in with test user...');
    const signInResponse = await instance.post('/auth/signin', {
      email: 'test@example.com',
      password: 'Password123!'
    });

    console.log('✅ Signed in successfully!');
    console.log('User ID:', signInResponse.data.data.id, '\n');

    // Step 2: Get AI to generate action plan for creating a task
    console.log('2. Requesting AI to create a task...');
    const aiResponse = await instance.post('/ai/chat', {
      message: 'Add task: Buy groceries from the store',
      sessionId: 'test-session-123'
    });

    console.log('🤖 AI Response:');
    console.log('- Success:', aiResponse.data.success);
    console.log('- Intent:', aiResponse.data.data?.detectedIntent?.type);
    console.log('- Action Plan:');

    if (aiResponse.data.data?.actionPlan) {
      for (const plan of aiResponse.data.data.actionPlan) {
        console.log(`  • Operation: ${plan.operation}`);
        console.log(`  • Endpoint: ${plan.endpoint}`);
        console.log(`  • Method: ${plan.method}`);
        if (plan.payload) {
          console.log(`  • Payload:`, JSON.stringify(plan.payload, null, 2));
        }

        // Step 3: Execute the action plan (simulating what the frontend should do)
        console.log(`\n3. Executing action plan: ${plan.operation} ${plan.method} ${plan.endpoint}`);

        try {
          const actionResponse = await instance({
            method: plan.method,
            url: plan.endpoint,
            data: plan.payload
          });

          console.log('✅ Action execution result:', actionResponse.data);

          // Step 4: Verify the task was created by fetching tasks
          console.log('\n4. Fetching tasks to verify creation...');
          const tasksResponse = await instance.get('/tasks');
          console.log('📋 All Tasks:', tasksResponse.data.data);

        } catch (actionError) {
          console.error('❌ Action execution failed:', actionError.message);
          if (actionError.response) {
            console.error('Status:', actionError.response.status);
            console.error('Response:', actionError.response.data);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during complete flow test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testCompleteFlow();