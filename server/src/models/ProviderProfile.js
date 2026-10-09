const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessPhone: {
      type: String,
      default: '',
      trim: true,
    },

    biography: {
      type: String,
      default: '',
    },
    serviceCategories: [{
      type: String,
      required: true,
    }],
    skills: [{
      type: String,
    }],
    languages: [{
      type: String,
      default: 'English',
    }],
    serviceAreas: [{
      city: String,
      locality: String,
      postalCode: String,
    }],
    experienceYears: {
      type: Number,
      default: 1,
    },
    completedJobsCount: {
      type: Number,
      default: 0,
    },
    indicativePriceRange: {
      min: { type: Number, default: 200 },
      max: { type: Number, default: 2000 },
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      workingHours: { type: String, default: '09:00 AM - 07:00 PM' },
    },
    profileImage: {
      type: String,
      default: '',
    },
    portfolio: [{
      imageUrl: { type: String, required: true },
      title: { type: String, default: 'Completed Project' },
      category: { type: String, default: 'General Repair' },
      description: { type: String, default: '' },
      uploadedAt: { type: Date, default: Date.now },
    }],
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    verificationDocs: [{
      docType: String,
      docUrl: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

providerProfileSchema.index({ serviceCategories: 1 });
providerProfileSchema.index({ skills: 1 });
providerProfileSchema.index({ 'serviceAreas.city': 1, 'serviceAreas.postalCode': 1 });
providerProfileSchema.index({ verificationStatus: 1 });
providerProfileSchema.index({ averageRating: -1 });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);

