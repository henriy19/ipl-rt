// Compatibility bridge for Railway if Start Command has 'cd backend' inside backend directory
const path = require('path');
const parentServer = path.join(__dirname, '../server.js');
console.log('Redirecting from backend/backend/server.js to:', parentServer);
require(parentServer);
