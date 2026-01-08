// Simple syntax test
const fs = require('fs');
const content = fs.readFileSync('src/pages/LiveTracking.jsx', 'utf8');
console.log('File length:', content.length);
console.log('First 100 chars:', content.substring(0, 100));
console.log('Last 100 chars:', content.substring(content.length - 100));
