// middlewares/auth.js
require('dotenv').config();
const { verifyToken } = require('../helpers/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Invalid token' });

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    next(err);
  }
};