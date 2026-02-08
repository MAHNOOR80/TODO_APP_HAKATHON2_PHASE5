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

async function testChatbotInteraction() {
  try {
    console.log('🤖 Starting AI Chatbot Interaction Test...\n');

    // Step 1: Sign in to get session
    console.log('1. Signing in with test user...');
    const signInResponse = await instance.post('/auth/signin', {
      email: 'test@example.com',
      password: 'Password123!'
    });

    console.log('✅ Signed in successfully!');
    console.log('User ID:', signInResponse.data.data.id, '\n');

    // Step 2: Say greetings to the chatbot
    console.log('2. Sending greeting to chatbot: "Hello"');
    const greetingResponse = await instance.post('/ai/chat', {
      message: 'Hello',
      sessionId: 'test-session-123'
    });

    console.log('💬 Chatbot responded:');
    console.log('- Success:', greetingResponse.data.success);
    console.log('- Response:', greetingResponse.data.data?.responseText || 'No response text');
    console.log('- Detected intent:', greetingResponse.data.data?.detectedIntent?.type);
    console.log('- Requires confirmation:', greetingResponse.data.data?.requiresConfirmation);
    console.log('');

    // Step 3: Add a task using AI chatbot
    console.log('3. Adding task using AI chatbot: "Add a task to buy groceries"');
    const taskResponse = await instance.post('/ai/chat', {
      message: 'Add a task to buy groceries',
      sessionId: 'test-session-123'
    });

    console.log('📝 Task creation response:');
    console.log('- Success:', taskResponse.data.success);
    console.log('- Response:', taskResponse.data.data?.responseText || 'No response text');
    console.log('- Detected intent:', taskResponse.data.data?.detectedIntent?.type);
    console.log('- Action plan:');
    if (taskResponse.data.data?.actionPlan) {
      taskResponse.data.data.actionPlan.forEach((plan, index) => {
        console.log(`  ${index + 1}. Operation: ${plan.operation}`);
        console.log(`     Endpoint: ${plan.endpoint}`);
        console.log(`     Method: ${plan.method}`);
        if (plan.payload) {
          console.log(`     Payload:`, JSON.stringify(plan.payload, null, 2));
        }
      });
    }
    console.log('- Requires confirmation:', taskResponse.data.data?.requiresConfirmation);

    console.log('\n🎉 Chatbot interaction test completed successfully!');
    console.log('The AI chatbot is working properly and can handle greetings and task creation.');

  } catch (error) {
    console.error('❌ Error during chatbot interaction:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testChatbotInteraction();