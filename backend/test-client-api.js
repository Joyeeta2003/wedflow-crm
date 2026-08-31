const http = require('http');

const BASE_URL = 'http://localhost:5001';
let authToken = null;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testHealth() {
  console.log('=== Testing Backend Health ===');
  const response = await makeRequest('GET', '/api/health');
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${JSON.stringify(response.data)}`);
  console.log(response.status === 200 ? '✓ Health check PASS\n' : '✗ Health check FAIL\n');
}

async function loginAndGetToken() {
  console.log('=== Login via OTP to get JWT ===');
  
  // Step 1: Send OTP
  console.log('1. Sending OTP...');
  const sendOtpResponse = await makeRequest('POST', '/api/auth/send-otp', {
    email: 'pritam@example.com',
    turnstileToken: 'test-token'
  });
  console.log(`Status: ${sendOtpResponse.status}`);
  console.log(`Response: ${JSON.stringify(sendOtpResponse.data)}`);

  if (sendOtpResponse.status !== 200) {
    console.log('✗ Failed to send OTP\n');
    return null;
  }

  // For testing, we'll need a real OTP. Since we can't receive emails in this test,
  // let's try to use an existing user if available or skip this step
  console.log('Note: In a real test, you would need to check email for OTP code');
  console.log('For automated testing, we need to either:');
  console.log('  1. Use a test OTP bypass mechanism, or');
  console.log('  2. Have you provide the OTP code manually\n');
  
  return null;
}

async function testGetClients() {
  if (!authToken) {
    console.log('=== Skipping GET /api/clients (no auth token) ===\n');
    return;
  }

  console.log('=== Testing GET /api/clients ===');
  const response = await makeRequest('GET', '/api/clients', null, {
    'Authorization': `Bearer ${authToken}`
  });
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
  
  if (response.status === 200 && response.data.success === true) {
    console.log('✓ GET /api/clients PASS\n');
  } else {
    console.log('✗ GET /api/clients FAIL\n');
  }
}

async function testPostClient() {
  if (!authToken) {
    console.log('=== Skipping POST /api/clients (no auth token) ===\n');
    return;
  }

  console.log('=== Testing POST /api/clients ===');
  const response = await makeRequest('POST', '/api/clients', {
    name: 'Test Client',
    phone: '9876543210',
    email: 'test@example.com',
    address: 'Asansol',
    status: 'active'
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
  
  if (response.status === 201 && response.data.success === true) {
    console.log('✓ POST /api/clients PASS\n');
  } else {
    console.log('✗ POST /api/clients FAIL\n');
  }
}

async function runTests() {
  try {
    await testHealth();
    
    // Note: Automated OTP testing requires email access or test bypass
    console.log('=== MANUAL TESTING REQUIRED ===');
    console.log('To test the Client API with authentication:');
    console.log('1. Log in via the frontend at http://localhost:4200/login');
    console.log('2. Open browser DevTools → Application → Local Storage');
    console.log('3. Copy the JWT token');
    console.log('4. Run the manual test commands below:\n');
    
    console.log('=== MANUAL TEST COMMANDS ===');
    console.log('GET /api/clients:');
    console.log(`curl -X GET ${BASE_URL}/api/clients -H "Authorization: Bearer YOUR_JWT"`);
    console.log('');
    console.log('POST /api/clients:');
    console.log(`curl -X POST ${BASE_URL}/api/clients \\`);
    console.log(`  -H "Authorization: Bearer YOUR_JWT" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"name":"Test Client","phone":"9876543210","email":"test@example.com","address":"Asansol","status":"active"}'`);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
