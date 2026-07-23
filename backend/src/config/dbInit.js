const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
    try {
        console.log('Ensuring schema migrations (users_penghuni & tanggal_lahir)...');
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS jumlah_penghuni INT DEFAULT 1;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;

            CREATE TABLE IF NOT EXISTS users_penghuni (
                id VARCHAR(36) PRIMARY KEY,
                no_hp VARCHAR(20) NOT NULL,
                nama_lengkap VARCHAR(150) NOT NULL,
                tanggal_lahir DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (no_hp) REFERENCES users(no_hp) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        const sqlPath = path.join(__dirname, '../../database/init.sql');
        if (fs.existsSync(sqlPath)) {
            console.log('Reading database initialization script (init.sql)...');
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sql);
            console.log('Database initialization completed successfully.');
        }
    } catch (err) {
        console.error('Error during database initialization:', err);
    }
}

module.exports = initializeDatabase;
