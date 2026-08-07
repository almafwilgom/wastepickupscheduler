import express from 'express';
import {
  createPickupRequest,
  getMyPickups,
  getCollectorAssignedPickups,
  getAllPickups,
  assignCollector,
  updatePickupStatus,
  cancelPickupRequest,
} from '../controllers/pickup.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Resident endpoints
router.post('/', authenticateUser, authorizeRoles('RESIDENT'), createPickupRequest);
router.get('/my-pickups', authenticateUser, authorizeRoles('RESIDENT'), getMyPickups);
router.put('/:id/cancel', authenticateUser, cancelPickupRequest);

// Collector endpoints
router.get('/assigned', authenticateUser, authorizeRoles('COLLECTOR'), getCollectorAssignedPickups);
router.put('/:id/status', authenticateUser, authorizeRoles('COLLECTOR', 'ADMIN'), updatePickupStatus);

// Admin endpoints
router.get('/all', authenticateUser, authorizeRoles('ADMIN'), getAllPickups);
router.put('/:id/assign', authenticateUser, authorizeRoles('ADMIN'), assignCollector);

export default router;
