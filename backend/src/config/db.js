const { Pool } = require('pg');

const getSslConfig = () => {
    if (process.env.DB_SSL === 'false') return false;
    if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
    if (process.env.DATABASE_URL) {
        if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
            return false;
        }
        if (process.env.DATABASE_URL.includes('sslmode=disable') || process.env.DATABASE_URL.includes('railway.internal')) {
            return false;
        }
        return { rejectUnauthorized: false };
    }
    return false;
};

// Create the connection pool
const pool = process.env.DATABASE_URL 
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: getSslConfig()
    })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ipl_rt_db',
        port: process.env.DB_PORT || 5432,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

// Test connection
pool.connect()
    .then(client => {
        console.log('Database connected successfully');
        client.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message || err);
    });

module.exports = pool;
