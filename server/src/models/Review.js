const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'flagged', 'removed'],
      default: 'approved',
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    videoThumbnail: {
      type: String,
      default: '',
      trim: true,
    },
    videoDuration: {
      type: String,
      default: '',
    },
    serviceCategory: {
      type: String,
      default: 'General Repair',
    },
    customerLocation: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ providerId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ isFeatured: 1, moderationStatus: 1 });


module.exports = mongoose.model('Review', reviewSchema);
