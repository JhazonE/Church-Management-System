const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
// const { startScheduledBackup } = require('./scripts/auto-backup');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Start automated backup service (disabled for now due to module loading issues)
// startScheduledBackup();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
    console.log('> Automated backup service is running');
  });
});
