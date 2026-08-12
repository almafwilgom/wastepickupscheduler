import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'waste_pickup_scheduler_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

/**
 * Public registration endpoint: RESIDENT ONLY
 * Security requirement: The backend MUST ALWAYS set role: 'RESIDENT'
 * and ignore any role passed by the client.
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Explicitly enforce role: 'RESIDENT'
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'RESIDENT',
      address: address || {},
      phone: phone || '',
      mustChangePassword: false,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Resident account created successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
  }
};

/**
 * Login existing user
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support or administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        vehicleType: user.vehicleType,
        vehicleNumber: user.vehicleNumber,
        assignedArea: user.assignedArea,
        availabilityStatus: user.availabilityStatus,
        mustChangePassword: user.mustChangePassword || false,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

/**
 * Admin creates a new Collector account
 * Endpoint: POST /api/auth/collectors
 */
export const createCollector = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, vehicleNumber, assignedArea } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Collector name, email, and temporary password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const collector = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'COLLECTOR',
      phone: phone || '',
      vehicleType: vehicleType || 'Waste Collection Truck',
      vehicleNumber: vehicleNumber || '',
      assignedArea: assignedArea || '',
      availabilityStatus: 'AVAILABLE',
      mustChangePassword: true,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Collector account created successfully',
      collector: {
        id: collector._id,
        _id: collector._id,
        name: collector.name,
        email: collector.email,
        role: collector.role,
        phone: collector.phone,
        vehicleType: collector.vehicleType,
        vehicleNumber: collector.vehicleNumber,
        assignedArea: collector.assignedArea,
        availabilityStatus: collector.availabilityStatus,
        mustChangePassword: collector.mustChangePassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create collector account', error: error.message });
  }
};

/**
 * Forced first-login or voluntary password change
 * Endpoint: POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user does NOT have mustChangePassword flag set, require current password verification
    if (!user.mustChangePassword && currentPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. You can now access your dashboard.',
      mustChangePassword: false,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
};

/**
 * Get current authenticated user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

/**
 * Get all collector users (Admin only)
 * Endpoint: GET /api/auth/collectors
 */
export const getCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ role: 'COLLECTOR' })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, collectors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch collectors', error: error.message });
  }
};

/**
 * Update collector account details/status (Admin only)
 * Endpoint: PATCH /api/auth/collectors/:id
 */
export const updateCollector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleType, vehicleNumber, assignedArea, availabilityStatus, isActive } = req.body;

    const collector = await User.findOne({ _id: id, role: 'COLLECTOR' });
    if (!collector) {
      return res.status(404).json({ success: false, message: 'Collector not found' });
    }

    if (name !== undefined) collector.name = name;
    if (phone !== undefined) collector.phone = phone;
    if (vehicleType !== undefined) collector.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) collector.vehicleNumber = vehicleNumber;
    if (assignedArea !== undefined) collector.assignedArea = assignedArea;
    if (availabilityStatus !== undefined) collector.availabilityStatus = availabilityStatus;
    if (isActive !== undefined) collector.isActive = isActive;

    await collector.save();

    return res.status(200).json({
      success: true,
      message: 'Collector updated successfully',
      collector,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update collector', error: error.message });
  }
};
