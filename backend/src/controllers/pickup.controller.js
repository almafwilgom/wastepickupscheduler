import { PickupRequest } from '../models/PickupRequest.js';
import { Notification } from '../models/Notification.js';

/**
 * Create a new pickup request (Resident)
 */
export const createPickupRequest = async (req, res) => {
  try {
    const { wasteType, scheduledDate, timeSlot, address, notes } = req.body;

    const pickup = await PickupRequest.create({
      resident: req.user._id,
      wasteType,
      scheduledDate,
      timeSlot: timeSlot || 'MORNING (8AM - 12PM)',
      address: address || req.user.address,
      notes: notes || '',
    });

    // Create confirmation notification for resident
    await Notification.create({
      user: req.user._id,
      title: 'Pickup Scheduled',
      message: `Your ${wasteType.toLowerCase()} waste pickup request has been received for ${new Date(scheduledDate).toLocaleDateString()}.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Waste pickup request submitted successfully',
      pickup,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create pickup request', error: error.message });
  }
};

/**
 * Get all pickup requests for the authenticated Resident
 */
export const getMyPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ resident: req.user._id })
      .populate('collector', 'name phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, pickups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your pickups', error: error.message });
  }
};

/**
 * Get all pickups assigned to the authenticated Collector
 */
export const getCollectorAssignedPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ collector: req.user._id })
      .populate('resident', 'name phone address')
      .sort({ scheduledDate: 1 });

    return res.status(200).json({ success: true, pickups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned route', error: error.message });
  }
};

/**
 * Get all pickup requests in the system (Admin only)
 */
export const getAllPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find()
      .populate('resident', 'name email phone address')
      .populate('collector', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, pickups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system pickups', error: error.message });
  }
};

/**
 * Admin assigns a collector driver to a pickup request
 */
export const assignCollector = async (req, res) => {
  try {
    const { id } = req.params;
    const { collectorId } = req.body;

    const pickup = await PickupRequest.findById(id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    pickup.collector = collectorId;
    pickup.status = 'SCHEDULED';
    await pickup.save();

    // Create notification for resident
    await Notification.create({
      user: pickup.resident,
      title: 'Collector Assigned',
      message: `A waste collector driver has been assigned to your pickup request #${id.slice(-6)}.`,
    });

    return res.status(200).json({ success: true, message: 'Collector assigned successfully', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to assign collector', error: error.message });
  }
};

/**
 * Update status of a pickup request (Collector or Admin)
 */
export const updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const pickup = await PickupRequest.findById(id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    pickup.status = status;
    await pickup.save();

    // Notify Resident of status update
    await Notification.create({
      user: pickup.resident,
      title: `Pickup Status Update: ${status}`,
      message: `Your pickup request status was updated to ${status}.`,
    });

    return res.status(200).json({ success: true, message: 'Pickup status updated', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pickup status', error: error.message });
  }
};

/**
 * Cancel a pickup request (Resident or Admin)
 */
export const cancelPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id);

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Verify ownership if resident
    if (req.user.role === 'RESIDENT' && pickup.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this pickup' });
    }

    pickup.status = 'CANCELLED';
    await pickup.save();

    return res.status(200).json({ success: true, message: 'Pickup request cancelled', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel pickup request', error: error.message });
  }
};
