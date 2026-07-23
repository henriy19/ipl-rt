require('dotenv').config();
const app = require('./src/app');
require('./src/config/db');

const initializeDatabase = require('./src/config/dbInit');

const PORT = process.env.PORT || 5000;

// Start Express server immediately so Railway container stays alive and healthy
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);

    // Asynchronously initialize database migrations
    initializeDatabase()
        .then(() => {
            console.log('Database initialization completed.');
        })
        .catch((err) => {
            console.warn('Database initialization note:', err.message || err);
        });
});
