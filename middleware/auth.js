const jwt = require('jsonwebtoken');
const { pool } = require('../db');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth middleware - checking request to:', req.path);
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth failed: No Bearer token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    console.log('🔐 Token extracted, length:', token?.length);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    console.log('🔐 Token decoded successfully for user:', decoded.email);
    
    // Check if user exists in database
    const { rows } = await pool.query('SELECT * FROM app_users WHERE id = $1', [decoded.id]);
    
    if (rows.length === 0) {
      console.log('❌ Auth failed: User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: rows[0].role || 'user'
    };
    
    console.log('✅ Auth successful for user:', req.user.email, 'role:', req.user.role);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Auth failed: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      console.log('❌ Auth failed: Token expired');
      return res.status(401).json({ error: 'Token expired' });
    } else {
      console.error('❌ Auth middleware error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
};
