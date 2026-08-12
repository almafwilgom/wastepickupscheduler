import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  createCollector,
  getCollectors,
  updateCollector,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected user routes
router.get('/me', authenticateUser, getProfile);
router.post('/change-password', authenticateUser, changePassword);

// Admin-only collector management routes
router.post('/collectors', authenticateUser, authorizeRoles('ADMIN'), createCollector);
router.get('/collectors', authenticateUser, authorizeRoles('ADMIN'), getCollectors);
router.patch('/collectors/:id', authenticateUser, authorizeRoles('ADMIN'), updateCollector);

export default router;
