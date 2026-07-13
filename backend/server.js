require('dotenv').config();
const app = require('./src/app');
require('./src/config/db');

const initializeDatabase = require('./src/config/dbInit');

const PORT = process.env.PORT || 5000;

initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database, server not started:', err.message);
        process.exit(1);
    });
