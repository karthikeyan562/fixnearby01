const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    photoUrls: [{
      type: String,
    }],
    serviceLocation: {
      city: { type: String, required: true },
      locality: { type: String, required: true },
      postalCode: { type: String, required: true },
      address: { type: String, default: '' },
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'quoted', 'booked', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ category: 1, status: 1 });
serviceRequestSchema.index({ customerId: 1 });
serviceRequestSchema.index({ 'serviceLocation.city': 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
