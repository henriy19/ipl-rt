const fs = require('fs');
const path = require('path');

console.log('--- STARTING IPL-RT APPLICATION ---');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

const candidatePaths = [
    path.join(__dirname, 'backend/server.js'),
    path.join(__dirname, 'server.js'),
    path.join(process.cwd(), 'backend/server.js'),
    path.join(process.cwd(), 'server.js')
];

let targetServer = candidatePaths.find(p => fs.existsSync(p));

if (targetServer) {
    console.log('Found server entry point at:', targetServer);
    require(targetServer);
} else {
    console.error('ERROR: server.js not found in candidate paths!');
    console.log('Files in __dirname:', fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : 'N/A');
    console.log('Files in process.cwd():', fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : 'N/A');
    process.exit(1);
}
