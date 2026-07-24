const fs = require('fs');
const path = require('path');

console.log('--- STARTING IPL-RT BACKEND APPLICATION ---');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

const targetServer = path.join(__dirname, 'server.js');
if (fs.existsSync(targetServer)) {
    console.log('Found backend server entry point at:', targetServer);
    require(targetServer);
} else {
    console.error('ERROR: backend/server.js not found!');
    process.exit(1);
}
