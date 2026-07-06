const http = require('http');

const data = JSON.stringify({
  action: 'user_login',
  userId: '60d5ecb8b392d70f00000000', // Dummy ObjectId
  userAgent: 'TestScript',
  metadata: { message: 'Test login' }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/activity-logs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let resData = '';
  res.on('data', chunk => { resData += chunk; });
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', resData);
    process.exit(0);
  });
});

req.on('error', error => {
  console.error('Error hitting API:', error);
  process.exit(1);
});

req.write(data);
req.end();
