const http = require('http');
const { execSync } = require('child_process');

function callTool(sourceId, toolName, args) {
  const params = JSON.stringify({ source_id: sourceId, tool_name: toolName, arguments: args });
  return JSON.parse(execSync(`external-tool call '${params}'`).toString());
}

const SPREADSHEET_ID = '1JaMtZqfprGAxNxU_j00PM3F8NK7uwQt4OU-qIufhu0k';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/waitlist') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, type } = JSON.parse(body);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid email' }));
          return;
        }
        const timestamp = new Date().toISOString();
        callTool('google_sheets__pipedream', 'google_sheets-add-rows', {
          spreadsheet_id: SPREADSHEET_ID,
          sheet_name: 'Waitlist',
          rows: [{ Email: email, Type: type || 'guest', Timestamp: timestamp }]
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(5000, () => console.log('Waitlist server running on port 5000'));
