const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    console.log('auth')
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.userId = decoded._id || decoded.userId;
    req.teacher = decoded.teacher;
    console.log(req.teacher);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const teacherMiddleware = (req, res, next) => {
  if (!req.teacher) {
    return res.status(403).json({ message: 'Access denied. Teacher or admin role required.' });
  }
  next();
};

module.exports = authMiddleware;
module.exports.teacherMiddleware = teacherMiddleware;
