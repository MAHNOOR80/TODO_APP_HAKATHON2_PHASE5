const axios = require('axios');

// Global variable to store session cookie
let sessionCookie = null;

// Create axios instance
const instance = axios.create({
  withCredentials: true
});

// Configuration
const BACKEND_URL = 'http://localhost:5006';

// Helper function to create a test user and get session
async function setupTestUser() {
  console.log('Setting up test user...');

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!', // Strong password with uppercase, lowercase, number, and special char
    name: 'Test User'
  };

  try {
    // Try to sign up the test user
    const signupResponse = await instance.post(`${BACKEND_URL}/api/v1/auth/signup`, testUser);

    // Extract session cookie from response headers
    const setCookieHeader = signupResponse.headers['set-cookie'];
    if (setCookieHeader) {
      const sessionCookieEntry = setCookieHeader.find(cookie => cookie.startsWith('todo_session='));
      if (sessionCookieEntry) {
        sessionCookie = sessionCookieEntry.split(';')[0];
        console.log('✓ Session cookie obtained');
      }
    }

    console.log('✓ Test user signed up successfully');
    return signupResponse.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'EMAIL_EXISTS') {
      console.log('✓ Test user already exists, attempting to sign in...');

      // If user exists, sign in
      try {
        const signinResponse = await instance.post(`${BACKEND_URL}/api/v1/auth/signin`, {
          email: testUser.email,
          password: testUser.password
        });

        // Extract session cookie from response headers
        const setCookieHeader = signinResponse.headers['set-cookie'];
        if (setCookieHeader) {
          const sessionCookieEntry = setCookieHeader.find(cookie => cookie.startsWith('todo_session='));
          if (sessionCookieEntry) {
            sessionCookie = sessionCookieEntry.split(';')[0];
            console.log('✓ Session cookie obtained');
          }
        }

        console.log('✓ Test user signed in successfully');
        return signinResponse.data;
      } catch (signinError) {
        console.error('✗ Signin failed:', signinError.response?.data || signinError.message);
        return null;
      }
    } else {
      console.error('✗ Signup failed:', error.response?.data || error.message);
      return null;
    }
  }
}

async function createTaskViaAI() {
  try {
    console.log('Attempting to create task via AI agent...');

    // The AI agent expects a natural language request
    // Use pattern that worked before to create a task
    const aiRequest = {
      message: 'Create a new task with title abcd'
    };

    console.log('Sending request to AI endpoint:', `${BACKEND_URL}/api/v1/ai/chat`);

    // Include session cookie in the request
    const response = await instance.post(`${BACKEND_URL}/api/v1/ai/chat`, aiRequest, {
      headers: {
        Cookie: sessionCookie
      }
    });

    console.log('AI Response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('✓ AI successfully processed the request!');

      // Now we need to execute the planned action
      const actionPlan = response.data.data.actionPlan;
      console.log('Action plan received:', JSON.stringify(actionPlan, null, 2));

      // Execute the action plan (creating the task)
      if (actionPlan && actionPlan.length > 0) {
        for (const action of actionPlan) {
          const endpoint = `${BACKEND_URL}/api/v1${action.endpoint}`;

          console.log(`Executing action: ${action.method} ${endpoint}`);
          if (action.payload) {
            console.log('Payload:', JSON.stringify(action.payload, null, 2));
          }

          const taskResponse = await instance({
            method: action.method,
            url: endpoint,
            data: action.payload,
            headers: {
              Cookie: sessionCookie,
              'Content-Type': 'application/json'
            }
          });

          console.log('✓ Action executed successfully:', JSON.stringify(taskResponse.data, null, 2));

          // If this is a task creation, return the created task
          if (action.operation === 'CREATE' && action.endpoint === '/tasks') {
            return taskResponse.data;
          }
        }
      }
    } else {
      console.error('✗ AI request failed:', response.data.error);
      return null;
    }
  } catch (error) {
    console.error('✗ Error creating task via AI:', error.response?.data || error.message);
    console.error('Full error details:', error.response?.data || error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('Starting AI agent test for task creation...');

  // Check if backend is running
  try {
    await instance.get(`${BACKEND_URL}/api/v1/health`);
    console.log('✓ Backend is running on', BACKEND_URL);
  } catch (error) {
    console.error('✗ Backend is not accessible. Please start the backend server first.');
    console.log('Run: cd backend && npm run dev');
    return;
  }

  // Set up test user
  const userSetup = await setupTestUser();
  if (!userSetup) {
    console.error('✗ Failed to set up test user');
    return;
  }

  // Try the AI agent
  await createTaskViaAI();

  // Verify the task was created by fetching tasks
  console.log('\n--- Verifying task creation ---');
  try {
    const tasksResponse = await instance.get(`${BACKEND_URL}/api/v1/tasks`, {
      headers: {
        Cookie: sessionCookie
      }
    });
    console.log('Current tasks:', JSON.stringify(tasksResponse.data, null, 2));
  } catch (error) {
    console.error('✗ Error fetching tasks:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTaskViaAI };