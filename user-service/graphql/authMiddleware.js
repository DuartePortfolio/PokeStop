import * as authService from '../services/authService.js';

// Middleware to extract and verify token from Authorization header
function authenticateTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);
  
  if (!payload) {
    req.user = null;
    return next();
  }
  
  req.user = payload;
  next();
}

export { authenticateTokenMiddleware };
