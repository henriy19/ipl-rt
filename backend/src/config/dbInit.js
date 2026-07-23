const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
    try {
        console.log('Ensuring schema migrations (users_penghuni, tanggal_lahir, & no_hp_penghuni)...');
        
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS jumlah_penghuni INT DEFAULT 1;').catch(e => console.error('Migration note:', e.message));
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;').catch(e => console.error('Migration note:', e.message));

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users_penghuni (
                id VARCHAR(36) PRIMARY KEY,
                no_hp VARCHAR(20) NOT NULL,
                no_hp_penghuni VARCHAR(20),
                nama_lengkap VARCHAR(150) NOT NULL,
                tanggal_lahir DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (no_hp) REFERENCES users(no_hp) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `).catch(e => console.error('Migration note:', e.message));

        await pool.query('ALTER TABLE users_penghuni ADD COLUMN IF NOT EXISTS no_hp_penghuni VARCHAR(20);').catch(e => console.error('Migration note:', e.message));

        const sqlPath = path.join(__dirname, '../../database/init.sql');
        if (fs.existsSync(sqlPath)) {
            console.log('Reading database initialization script (init.sql)...');
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sql).catch(e => console.warn('Note on init.sql seed:', e.message));
            console.log('Database initialization completed successfully.');
        }
    } catch (err) {
        console.error('Error during database initialization:', err);
    }
}

module.exports = initializeDatabase;
