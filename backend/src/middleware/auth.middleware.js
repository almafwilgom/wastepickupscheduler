import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Verifies bearer JWT token sent in authorization header.
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied: Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'waste_pickup_scheduler_super_secret_jwt_key_2026');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed', error: error.message });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Example usage: authorizeRoles('ADMIN', 'COLLECTOR')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user?.role || 'UNKNOWN'}' is not authorized to perform this operation`,
      });
    }
    next();
  };
};
