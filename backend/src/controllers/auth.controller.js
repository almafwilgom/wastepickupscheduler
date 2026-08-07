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
 * Register a new user (RESIDENT by default, or COLLECTOR/ADMIN)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'RESIDENT',
      address: address || {},
      phone: phone || '',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

/**
 * Get current authenticated user profile
 */
export const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * Get all collector users (Admin only helper)
 */
export const getCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ role: 'COLLECTOR' }).select('name email phone');
    return res.status(200).json({ success: true, collectors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch collectors', error: error.message });
  }
};
