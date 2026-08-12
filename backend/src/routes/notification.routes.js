import express from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateUser, getMyNotifications);
router.put('/read-all', authenticateUser, markAllAsRead);
router.patch('/read-all', authenticateUser, markAllAsRead);
router.put('/:id/read', authenticateUser, markAsRead);
router.patch('/:id/read', authenticateUser, markAsRead);

export default router;
