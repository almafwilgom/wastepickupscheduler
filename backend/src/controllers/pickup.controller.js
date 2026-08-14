import { PickupRequest } from '../models/PickupRequest.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { sendWhatsAppSMS } from '../services/sms.service.js';

/**
 * Create a new pickup request (Resident)
 * Endpoint: POST /api/pickups
 */
export const createPickupRequest = async (req, res) => {
  try {
    const { wasteType, scheduledDate, timeSlot, address, notes } = req.body;

    if (!wasteType || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Waste type and scheduled date are required' });
    }

    const pickupAddress = {
      street: address?.street || req.user.address?.street || '',
      city: address?.city || req.user.address?.city || '',
      postalCode: address?.postalCode || req.user.address?.postalCode || '',
    };

    const pickup = await PickupRequest.create({
      resident: req.user._id,
      wasteType,
      scheduledDate,
      timeSlot: timeSlot || 'MORNING (8AM - 12PM)',
      address: pickupAddress,
      notes: notes || '',
      status: 'PENDING',
    });

    // Confirmation notification for resident
    await Notification.create({
      user: req.user._id,
      pickupId: pickup._id,
      type: 'PICKUP_CREATED',
      title: 'Pickup Scheduled',
      message: `Your ${wasteType.toLowerCase()} waste pickup request #${pickup._id.toString().slice(-6)} has been submitted for ${new Date(scheduledDate).toLocaleDateString()}.`,
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
 * Get all pickup requests for authenticated Resident or Collector
 * Endpoint: GET /api/pickups/my-pickups or GET /api/pickups/my
 */
export const getMyPickups = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'RESIDENT') {
      query = { resident: req.user._id };
    } else if (req.user.role === 'COLLECTOR') {
      query = { collector: req.user._id };
    } else if (req.user.role === 'ADMIN') {
      query = {}; // Admin sees all
    }

    const pickups = await PickupRequest.find(query)
      .populate('resident', 'name email phone address')
      .populate('collector', 'name email phone vehicleType vehicleNumber availabilityStatus')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, pickups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pickups', error: error.message });
  }
};

/**
 * Get all pickups assigned to the authenticated Collector
 * Endpoint: GET /api/pickups/assigned
 */
export const getCollectorAssignedPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ collector: req.user._id })
      .populate('resident', 'name email phone address')
      .sort({ scheduledDate: 1, createdAt: -1 });

    return res.status(200).json({ success: true, pickups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned pickups route', error: error.message });
  }
};

/**
 * Get single pickup details with ownership check
 * Endpoint: GET /api/pickups/:id
 */
export const getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id)
      .populate('resident', 'name email phone address')
      .populate('collector', 'name email phone vehicleType vehicleNumber availabilityStatus');

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Role Ownership check (Phase 17)
    if (req.user.role === 'RESIDENT' && pickup.resident._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this pickup request' });
    }

    if (req.user.role === 'COLLECTOR' && (!pickup.collector || pickup.collector._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view another collector\'s assigned pickup' });
    }

    return res.status(200).json({ success: true, pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pickup request details', error: error.message });
  }
};

/**
 * Get all pickup requests in system (Admin only)
 * Endpoint: GET /api/pickups/all
 */
export const getAllPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find()
      .populate('resident', 'name email phone address')
      .populate('collector', 'name email phone vehicleType vehicleNumber availabilityStatus')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, pickups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system pickups', error: error.message });
  }
};

/**
 * Admin assigns a collector driver to a pickup request
 * Endpoint: PUT /api/pickups/:id/assign or PATCH /api/pickups/:id/assign
 */
export const assignCollector = async (req, res) => {
  try {
    const { id } = req.params;
    const { collectorId } = req.body;

    if (!collectorId) {
      return res.status(400).json({ success: false, message: 'Collector ID is required for assignment' });
    }

    const pickup = await PickupRequest.findById(id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    const collector = await User.findById(collectorId);
    if (!collector || collector.role !== 'COLLECTOR') {
      return res.status(400).json({ success: false, message: 'Specified user is not a valid collector driver' });
    }

    if (collector.availabilityStatus === 'OFF_DUTY') {
      return res.status(400).json({ success: false, message: 'This collector is currently off duty' });
    }

    pickup.collector = collectorId;
    pickup.status = 'ASSIGNED';
    pickup.assignedAt = new Date();
    await pickup.save();

    // Notify Resident
    await Notification.create({
      user: pickup.resident,
      pickupId: pickup._id,
      type: 'COLLECTOR_ASSIGNED',
      title: 'Collector Assigned',
      message: `Collector ${collector.name} (${collector.phone || 'Driver'}) has been assigned to your pickup request #${id.slice(-6)}.`,
    });

    // Notify Collector
    await Notification.create({
      user: collector._id,
      pickupId: pickup._id,
      type: 'NEW_PICKUP_ASSIGNED',
      title: 'New Pickup Route Assigned',
      message: `You have been assigned a new pickup stop at ${pickup.address?.street}, ${pickup.address?.city}.`,
    });

    const updatedPickup = await PickupRequest.findById(id)
      .populate('resident', 'name email phone address')
      .populate('collector', 'name email phone vehicleType vehicleNumber');

    return res.status(200).json({ success: true, message: 'Collector assigned successfully', pickup: updatedPickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to assign collector', error: error.message });
  }
};

/**
 * Collector accepts pickup assignment
 * Endpoint: PATCH /api/pickups/:id/accept
 */
export const acceptPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id);

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Ownership check
    if (pickup.collector?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this pickup' });
    }

    pickup.status = 'ACCEPTED';
    pickup.acceptedAt = new Date();
    await pickup.save();

    // Notify Resident
    await Notification.create({
      user: pickup.resident,
      pickupId: pickup._id,
      type: 'PICKUP_ACCEPTED',
      title: 'Pickup Accepted',
      message: `Collector driver has accepted your pickup request #${id.slice(-6)} and added it to today's schedule.`,
    });

    return res.status(200).json({ success: true, message: 'Pickup accepted successfully', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to accept pickup', error: error.message });
  }
};

/**
 * Collector marks pickup "On The Way" & triggers SMS to resident (Phase 14 & Phase 15)
 * Endpoint: PATCH /api/pickups/:id/on-the-way
 */
export const markOnTheWay = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id).populate('resident', 'name phone email');

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Security Ownership Check (Phase 15 & 17)
    if (pickup.collector?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update another collector\'s pickup' });
    }

    // Validate state transition
    const validPreviousStates = ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'];
    if (!validPreviousStates.includes(pickup.status)) {
      return res.status(400).json({ success: false, message: `Cannot set ON_THE_WAY from status '${pickup.status}'` });
    }

    pickup.status = 'ON_THE_WAY';
    pickup.startedAt = new Date();
    await pickup.save();

    // 1. Create Web Notification
    await Notification.create({
      user: pickup.resident._id,
      pickupId: pickup._id,
      type: 'COLLECTOR_ON_THE_WAY',
      title: '🚛 Collector On The Way!',
      message: 'Your Waste Pickup Scheduler collector is on the way to collect your waste. Please ensure your waste is ready.',
    });

    // 2. Attempt SMS Notification (Prevent duplicate SMS if already sent)
    let smsNotificationResult = { attempted: false, success: false, message: '' };

    if (pickup.smsStatus !== 'SENT' && pickup.resident?.phone) {
      smsNotificationResult.attempted = true;
      const smsMessage = 'Your Waste Pickup Scheduler collector is on the way to collect your waste. Please ensure your waste is ready.';
      
      const smsRes = await sendWhatsAppSMS(pickup.resident.phone, smsMessage);
      if (smsRes.success) {
        pickup.smsStatus = 'SENT';
        smsNotificationResult.success = true;
        smsNotificationResult.message = 'WhatsApp/SMS alert sent successfully';
      } else {
        pickup.smsStatus = 'FAILED';
        smsNotificationResult.success = false;
        smsNotificationResult.message = smsRes.message || 'WhatsApp/SMS delivery failed';
      }
      await pickup.save();
    } else if (pickup.smsStatus === 'SENT') {
      smsNotificationResult.message = 'WhatsApp/SMS notification was already sent previously';
    } else if (!pickup.resident?.phone) {
      smsNotificationResult.message = 'Resident does not have a registered phone number';
    }

    return res.status(200).json({
      success: true,
      message: smsNotificationResult.success
        ? 'Pickup updated to ON THE WAY and SMS sent'
        : 'Pickup updated to ON THE WAY (SMS warning: ' + smsNotificationResult.message + ')',
      pickup,
      smsResult: smsNotificationResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pickup to ON THE WAY', error: error.message });
  }
};

/**
 * Collector marks waste as collected
 * Endpoint: PATCH /api/pickups/:id/collected
 */
export const markCollected = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id);

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    if (pickup.collector?.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this pickup' });
    }

    pickup.status = 'COLLECTED';
    pickup.collectedAt = new Date();
    await pickup.save();

    await Notification.create({
      user: pickup.resident,
      pickupId: pickup._id,
      type: 'WASTE_COLLECTED',
      title: 'Waste Collected',
      message: 'Your waste has been collected by the collector team.',
    });

    return res.status(200).json({ success: true, message: 'Pickup marked as collected', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark as collected', error: error.message });
  }
};

/**
 * Collector or Admin completes pickup
 * Endpoint: PATCH /api/pickups/:id/completed
 */
export const markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id);

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    if (pickup.collector?.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this pickup' });
    }

    pickup.status = 'COMPLETED';
    pickup.completedAt = new Date();
    await pickup.save();

    await Notification.create({
      user: pickup.resident,
      pickupId: pickup._id,
      type: 'PICKUP_COMPLETED',
      title: 'Pickup Finalized',
      message: `Your pickup request #${id.slice(-6)} has been successfully completed. Thank you for keeping our community clean!`,
    });

    return res.status(200).json({ success: true, message: 'Pickup request completed successfully', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to complete pickup', error: error.message });
  }
};

/**
 * Generic status update with strict workflow validation
 * Endpoint: PUT or PATCH /api/pickups/:id/status
 */
export const updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'ON_THE_WAY', 'COLLECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status provided: ${status}` });
    }

    const pickup = await PickupRequest.findById(id).populate('resident', 'name phone email');
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Role Security Ownership Check
    if (req.user.role === 'COLLECTOR') {
      if (!pickup.collector || pickup.collector.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update another collector\'s assigned pickup' });
      }
    } else if (req.user.role === 'RESIDENT') {
      if (pickup.resident._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to modify this pickup request' });
      }
      if (status !== 'CANCELLED') {
        return res.status(403).json({ success: false, message: 'Residents can only cancel their own pending pickups' });
      }
    }

    pickup.status = status;
    if (status === 'ACCEPTED' || status === 'SCHEDULED') pickup.acceptedAt = new Date();
    if (status === 'ON_THE_WAY' || status === 'IN_PROGRESS') pickup.startedAt = new Date();
    if (status === 'COLLECTED') pickup.collectedAt = new Date();
    if (status === 'COMPLETED') pickup.completedAt = new Date();

    await pickup.save();

    // Trigger Web Notification
    await Notification.create({
      user: pickup.resident._id,
      pickupId: pickup._id,
      type: `STATUS_${status}`,
      title: `Pickup Status: ${status.replace(/_/g, ' ')}`,
      message: `Your pickup request #${id.slice(-6)} status was updated to ${status.replace(/_/g, ' ')}.`,
    });

    // If status changed to ON_THE_WAY, trigger SMS
    if (status === 'ON_THE_WAY' && pickup.smsStatus !== 'SENT' && pickup.resident?.phone) {
      const smsMessage = 'Your Waste Pickup Scheduler collector is on the way to collect your waste. Please ensure your waste is ready.';
      const smsRes = await sendSMS(pickup.resident.phone, smsMessage);
      pickup.smsStatus = smsRes.success ? 'SENT' : 'FAILED';
      await pickup.save();
    }

    return res.status(200).json({ success: true, message: `Pickup status updated to ${status}`, pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pickup status', error: error.message });
  }
};

/**
 * Cancel a pickup request (Resident or Admin)
 * Endpoint: PUT or PATCH /api/pickups/:id/cancel
 */
export const cancelPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id);

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Ownership check for resident
    if (req.user.role === 'RESIDENT' && pickup.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this pickup request' });
    }

    if (pickup.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Completed pickups cannot be cancelled' });
    }

    pickup.status = 'CANCELLED';
    await pickup.save();

    await Notification.create({
      user: pickup.resident,
      pickupId: pickup._id,
      type: 'PICKUP_CANCELLED',
      title: 'Pickup Cancelled',
      message: `Pickup request #${id.slice(-6)} has been cancelled.`,
    });

    return res.status(200).json({ success: true, message: 'Pickup request cancelled', pickup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel pickup request', error: error.message });
  }
};
