const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_12345');
            
            // Simpan info user ke request object agar bisa diakses controller selanjutnya
            req.user = decoded;
            
            next();
        } catch (error) {
            console.error('JWT Verification error:', error.message);
            return res.status(401).json({ message: 'Akses ditolak, token tidak valid' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, tidak ada token' });
    }
};

module.exports = { protect };
