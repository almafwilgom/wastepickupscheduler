import express from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateUser, getMyNotifications);
router.put('/:id/read', authenticateUser, markAsRead);

export default router;
