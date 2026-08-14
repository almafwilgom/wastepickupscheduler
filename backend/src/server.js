import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

app.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Server] Port ${PORT} is busy. Trying fallback port 5001...`);
    const fallbackPort = 5001;
    app.listen(fallbackPort, () => {
      console.log(`[Server] Waste Pickup API server running on http://localhost:${fallbackPort}`);
    });
  } else {
    console.error('[Server Error]', err);
  }
});

// Global Middleware with increased payload size limit for profile picture uploads
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Waste Pickup Scheduler API is online', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${err.stack || err.message}`);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[Server] Waste Pickup API server running on http://localhost:${PORT}`);
});
