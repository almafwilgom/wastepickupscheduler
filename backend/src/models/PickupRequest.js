import mongoose from 'mongoose';

const pickupRequestSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident ID is required'],
    },
    wasteType: {
      type: String,
      enum: ['GENERAL', 'ORGANIC', 'RECYCLABLE', 'HAZARDOUS', 'BULK'],
      required: [true, 'Waste type is required'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled pickup date is required'],
    },
    timeSlot: {
      type: String,
      enum: ['MORNING (8AM - 12PM)', 'AFTERNOON (12PM - 4PM)', 'EVENING (4PM - 7PM)'],
      default: 'MORNING (8AM - 12PM)',
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ASSIGNED',
        'ACCEPTED',
        'SCHEDULED',
        'IN_PROGRESS',
        'ON_THE_WAY',
        'COLLECTED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING',
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    assignedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    collectedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    smsStatus: {
      type: String,
      enum: ['NOT_SENT', 'PENDING', 'SENT', 'FAILED'],
      default: 'NOT_SENT',
    },
  },
  {
    timestamps: true,
  }
);

export const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
