const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
    },
    agreedPrice: {
      type: Number,
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    serviceAddress: {
      city: String,
      locality: String,
      postalCode: String,
      address: String,
    },
    status: {
      type: String,
      enum: ['confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    statusHistory: [{
      status: String,
      note: String,
      updatedAt: { type: Date, default: Date.now }
    }],
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ requestId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
