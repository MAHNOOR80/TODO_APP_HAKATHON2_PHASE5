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

// Function to create a task directly (not using AI)
async function createTaskDirectly() {
  console.log('Attempting to create task directly...');

  try {
    const taskData = {
      title: 'abcd',
      description: 'Task created directly via API',
      priority: 'medium',
      completed: false
    };

    const response = await instance.post(`${BACKEND_URL}/api/v1/tasks`, taskData, {
      headers: {
        Cookie: sessionCookie,
        'Content-Type': 'application/json'
      }
    });

    console.log('✓ Task created successfully:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('✗ Error creating task directly:', error.response?.data || error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('Starting direct task creation test...');

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

  // Try to create a task directly
  await createTaskDirectly();

  // Verify the task was created by fetching tasks
  console.log('\n--- Verifying task creation ---');
  try {
    const tasksResponse = await instance.get(`${BACKEND_URL}/api/v1/tasks`, {
      headers: {
        Cookie: sessionCookie
      }
    });

    console.log('Current tasks:');
    tasksResponse.data.data.forEach((task, index) => {
      console.log(`${index + 1}. ID: ${task.id}, Title: "${task.title}", Completed: ${task.completed}`);
    });

    // Check if our task was created
    const targetTask = tasksResponse.data.data.find(task => task.title === 'abcd');
    if (targetTask) {
      console.log('✓ Successfully found our task with title "abcd"!');
    } else {
      console.log('✗ Could not find task with title "abcd"');
    }
  } catch (error) {
    console.error('✗ Error fetching tasks:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTaskDirectly };