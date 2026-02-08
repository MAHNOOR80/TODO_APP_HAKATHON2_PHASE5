const axios = require('axios');

// Create axios instance with cookie jar functionality using a custom approach
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

async function testAIChat() {
  try {
    console.log('📝 Testing AI Chat functionality...\n');

    // Step 1: Sign in to get session
    console.log('1. Signing in with test user...');
    const signInResponse = await instance.post('/auth/signin', {
      email: 'test@example.com',
      password: 'Password123!'
    });

    console.log('✅ Signed in successfully!');
    console.log('User ID:', signInResponse.data.data.id);

    // Step 2: Test AI chat endpoint
    console.log('\n2. Testing AI chat endpoint...');
    const aiResponse = await instance.post('/ai/chat', {
      message: 'Hello, can you help me manage my tasks?',
      sessionId: 'test-session-123'
    });

    console.log('✅ AI Chat response received:');
    console.log(JSON.stringify(aiResponse.data, null, 2));

    // Step 3: Try creating a task via AI
    console.log('\n3. Testing AI task creation...');
    const taskCreationResponse = await instance.post('/ai/chat', {
      message: 'Add a task to buy groceries',
      sessionId: 'test-session-123'
    });

    console.log('✅ AI Task creation response:');
    console.log(JSON.stringify(taskCreationResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
  }
}

testAIChat();