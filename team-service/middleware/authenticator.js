import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pokestop-secret-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function authorizeSelf(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  const paramId = Number(req.params.userId || req.params.id);
  const userId = Number(req.user.id);
  if (Number.isNaN(paramId)) return res.status(400).json({ error: 'Invalid user id parameter' });
  if (userId !== paramId) return res.status(403).json({ error: 'Forbidden: can only access your own resource' });
  next();
}

export { authenticateToken, authorizeSelf };