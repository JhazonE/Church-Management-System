const express = require('express');
const path = require('path');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

// Serve static files from the Next.js build
app.use(express.static(path.join(__dirname, '.next', 'static')));
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving the index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'server', 'app', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CLC Finance running on http://localhost:\${PORT}`);
  console.log('Press Ctrl+C to stop the server');
  console.log('');
  console.log('Login Credentials:');
  console.log('  Admin: admin / password');
  console.log('  Staff: staff / password');
});
