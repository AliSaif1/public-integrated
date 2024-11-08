import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) return res.status(401).json({ message: 'No token provided, authorization denied' });

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decodedData?.id; 
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};