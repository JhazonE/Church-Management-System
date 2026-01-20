const http = require('http');

function testLogin() {
  const postData = JSON.stringify({
    username: 'admin',
    password: 'password'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response body:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e);
  });

  console.log('Sending request with body:', postData);
  req.write(postData);
  req.end();
}

testLogin();
