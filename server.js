// Bridge server.js at repository root referencing backend/server.js
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'backend/server.js'))) {
    require('./backend/server.js');
} else if (fs.existsSync(path.join(__dirname, 'src/app.js'))) {
    // Already inside backend directory
    require('./server.js');
} else {
    console.error('Could not locate backend server entry point.');
}
