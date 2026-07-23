const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const iuranRoutes = require('./routes/iuranRoutes');
const rtRoutes = require('./routes/rtRoutes');
const rwRoutes = require('./routes/rwRoutes');
const strukturRoutes = require('./routes/strukturRoutes');
const roleRoutes = require('./routes/roleRoutes');
const informasiRoutes = require('./routes/informasiRoutes');
const tagihanRoutes = require('./routes/tagihanRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const path = require('path');
const { responseFormatter, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(responseFormatter);

const fs = require('fs');

// Basic route for health check
app.get('/api-health', (req, res) => {
    res.json({ message: 'Welcome to IPL RT API' });
});

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/iuran', iuranRoutes);
app.use('/api/rt', rtRoutes);
app.use('/api/rw', rwRoutes);
app.use('/api/struktur', strukturRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/informasi', informasiRoutes);
app.use('/api/tagihan', tagihanRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static frontend build files if dist exists
const distPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
    console.log(`Serving static frontend build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Error handling middleware
app.use(errorHandler);

module.exports = app;
