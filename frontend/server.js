import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;

const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
    console.log(`Serving static frontend from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.error(`Dist directory not found at ${distPath}`);
    app.get('*', (req, res) => {
        res.send('Frontend dist build not found. Please build frontend first.');
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend static server running on port ${PORT}`);
});
