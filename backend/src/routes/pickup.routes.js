import express from 'express';
import {
  createPickupRequest,
  getMyPickups,
  getCollectorAssignedPickups,
  getAllPickups,
  getPickupById,
  assignCollector,
  acceptPickup,
  markOnTheWay,
  markCollected,
  markCompleted,
  updatePickupStatus,
  cancelPickupRequest,
} from '../controllers/pickup.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Shared authenticated endpoints
router.get('/my-pickups', authenticateUser, getMyPickups);
router.get('/my', authenticateUser, getMyPickups);

// Resident endpoints
router.post('/', authenticateUser, authorizeRoles('RESIDENT'), createPickupRequest);
router.put('/:id/cancel', authenticateUser, cancelPickupRequest);
router.patch('/:id/cancel', authenticateUser, cancelPickupRequest);

// Collector specific endpoints
router.get('/assigned', authenticateUser, authorizeRoles('COLLECTOR'), getCollectorAssignedPickups);
router.patch('/:id/accept', authenticateUser, authorizeRoles('COLLECTOR'), acceptPickup);
router.patch('/:id/on-the-way', authenticateUser, authorizeRoles('COLLECTOR'), markOnTheWay);
router.patch('/:id/collected', authenticateUser, authorizeRoles('COLLECTOR', 'ADMIN'), markCollected);
router.patch('/:id/completed', authenticateUser, authorizeRoles('COLLECTOR', 'ADMIN'), markCompleted);

// Admin endpoints
router.get('/all', authenticateUser, authorizeRoles('ADMIN'), getAllPickups);
router.put('/:id/assign', authenticateUser, authorizeRoles('ADMIN'), assignCollector);
router.patch('/:id/assign', authenticateUser, authorizeRoles('ADMIN'), assignCollector);

// Shared status update & detail endpoints
router.get('/:id', authenticateUser, getPickupById);
router.put('/:id/status', authenticateUser, updatePickupStatus);
router.patch('/:id/status', authenticateUser, updatePickupStatus);

export default router;
