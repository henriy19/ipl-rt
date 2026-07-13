const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
    try {
        const sqlPath = path.join(__dirname, '../../database/init.sql');
        if (!fs.existsSync(sqlPath)) {
            console.warn(`Database initialization file not found at: ${sqlPath}`);
            return;
        }

        console.log('Reading database initialization script (init.sql)...');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing database initialization queries...');
        await pool.query(sql);
        console.log('Database initialization completed successfully.');
    } catch (err) {
        console.error('Error during database initialization:', err);
        throw err;
    }
}

module.exports = initializeDatabase;
