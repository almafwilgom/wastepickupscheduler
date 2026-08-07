import express from 'express';
import { registerUser, loginUser, getProfile, getCollectors } from '../controllers/auth.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateUser, getProfile);
router.get('/collectors', authenticateUser, authorizeRoles('ADMIN'), getCollectors);

export default router;
