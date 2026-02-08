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

async function testNaturalLanguageProcessing() {
  try {
    console.log('🗣️ Testing Natural Language Processing for AI Chatbot...\n');

    // Step 1: Sign in to get session
    console.log('1. Signing in with test user...');
    const signInResponse = await instance.post('/auth/signin', {
      email: 'test@example.com',
      password: 'Password123!'
    });

    console.log('✅ Signed in successfully!');
    console.log('User ID:', signInResponse.data.data.id, '\n');

    // Test various natural language inputs that should trigger task creation
    const testMessages = [
      { message: "Hello", expected: "greeting" },
      { message: "Add a task to buy groceries", expected: "create_task" },
      { message: "I need to buy groceries", expected: "create_task" },
      { message: "Remind me to call John", expected: "create_task" },
      { message: "Buy milk from the store", expected: "create_task" },
      { message: "Don't forget to pay bills", expected: "create_task" },
      { message: "Add task: Walk the dog", expected: "create_task" }
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const test = testMessages[i];
      console.log(`${i + 2}. Testing: "${test.message}" (Expected: ${test.expected})`);

      const response = await instance.post('/ai/chat', {
        message: test.message,
        sessionId: 'test-session-123'
      });

      console.log('   Response Text:', response.data.data?.responseText || 'No response');
      console.log('   Detected Intent:', response.data.data?.detectedIntent?.type);
      console.log('   Task Title Extracted:', response.data.data?.detectedIntent?.parameters?.taskTitle);
      console.log('   Confidence:', response.data.data?.detectedIntent?.confidence);
      console.log('   Action Plan Operation:', response.data.data?.actionPlan?.[0]?.operation);
      console.log('   Action Plan Payload:', JSON.stringify(response.data.data?.actionPlan?.[0]?.payload, null, 2));
      console.log('');
    }

    // Also fetch current tasks to see what was actually created
    console.log('🔍 Fetching all tasks to see what was created...');
    const tasksResponse = await instance.get('/tasks');
    console.log('📋 Current Tasks:', tasksResponse.data.data.length);
    tasksResponse.data.data.forEach((task, index) => {
      console.log(`   ${index + 1}. "${task.title}" - Created: ${task.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error during natural language test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testNaturalLanguageProcessing();