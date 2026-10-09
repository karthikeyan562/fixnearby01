const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedPrice: {
      type: Number,
      required: [true, 'Proposed price is required'],
      min: [0, 'Price must be positive'],
    },
    workDescription: {
      type: String,
      required: [true, 'Work description is required'],
    },
    estimatedDuration: {
      type: String,
      default: '1-2 hours',
    },
    proposedAppointment: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

quotationSchema.index({ requestId: 1 });
quotationSchema.index({ providerId: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
