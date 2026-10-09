const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.getProviders = async (req, res) => {
  try {
    const { category, city, locality, search, verificationStatus, minRating, minExperience, isAvailable, sortBy } = req.query;

    const query = {};

    if (category) {
      query.serviceCategories = { $regex: new RegExp(category, 'i') };
    }

    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    if (minExperience) {
      query.experienceYears = { $gte: parseInt(minExperience, 10) };
    }

    if (isAvailable === 'true') {
      query['availability.isAvailable'] = true;
    }

    if (city || locality) {
      const areaConditions = [];
      if (city) areaConditions.push({ 'serviceAreas.city': { $regex: new RegExp(city, 'i') } });
      if (locality) areaConditions.push({ 'serviceAreas.locality': { $regex: new RegExp(locality, 'i') } });
      query.$and = areaConditions;
    }

    let sortOptions = { averageRating: -1, reviewCount: -1 };
    if (sortBy === 'rating') sortOptions = { averageRating: -1 };
    if (sortBy === 'experience') sortOptions = { experienceYears: -1 };
    if (sortBy === 'price_asc') sortOptions = { 'indicativePriceRange.min': 1 };
    if (sortBy === 'price_desc') sortOptions = { 'indicativePriceRange.max': -1 };

    // Sanitized: populate only public fields (omit phone and email for privacy in public listings)
    let profiles = await ProviderProfile.find(query)
      .populate('userId', 'name location accountStatus')
      .sort(sortOptions);

    // Exclude profiles of suspended users
    profiles = profiles.filter(p => p.userId && p.userId.accountStatus !== 'suspended');

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      profiles = profiles.filter(p => 
        searchRegex.test(p.businessName) || 
        searchRegex.test(p.biography) || 
        p.serviceCategories.some(c => searchRegex.test(c)) ||
        (p.skills && p.skills.some(s => searchRegex.test(s))) ||
        (p.userId && searchRegex.test(p.userId.name))
      );
    }

    res.json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    let profile = await ProviderProfile.findById(req.params.id)
      .populate('userId', 'name location createdAt');

    if (!profile) {
      // Try finding by userId
      profile = await ProviderProfile.findOne({ userId: req.params.id })
        .populate('userId', 'name location createdAt');
    }

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    const reviews = await Review.find({ providerId: profile.userId._id, moderationStatus: 'approved' })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    // Calculate completed jobs dynamically if missing or 0
    if (!profile.completedJobsCount) {
      const completedCount = await Booking.countDocuments({ providerId: profile.userId._id, status: 'completed' });
      profile.completedJobsCount = completedCount;
    }

    res.json({
      success: true,
      data: profile,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { businessName, businessPhone, biography, serviceCategories, skills, languages, serviceAreas, experienceYears, indicativePriceRange, profileImage, portfolio } = req.body;

    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new ProviderProfile({ userId: req.user._id, businessName: `${req.user.name}'s Services` });
    }

    if (businessName) profile.businessName = businessName;
    if (businessPhone !== undefined) profile.businessPhone = businessPhone;
    if (biography !== undefined) profile.biography = biography;

    if (serviceCategories) profile.serviceCategories = serviceCategories;
    if (skills) profile.skills = skills;
    if (languages) profile.languages = languages;
    if (serviceAreas) profile.serviceAreas = serviceAreas;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (indicativePriceRange) profile.indicativePriceRange = indicativePriceRange;
    if (profileImage) profile.profileImage = profileImage;
    if (portfolio) profile.portfolio = portfolio;

    await profile.save();

    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, workingHours } = req.body;

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    if (isAvailable !== undefined) profile.availability.isAvailable = isAvailable;
    if (workingHours) profile.availability.workingHours = workingHours;

    await profile.save();

    res.json({
      success: true,
      data: profile.availability,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addPortfolioItem = async (req, res) => {
  try {
    const { imageUrl, title, category, description } = req.body;

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    const newItem = {
      imageUrl: imageUrl || req.file?.path || '/uploads/sample_portfolio.jpg',
      title: title || 'Completed Repair Job',
      category: category || profile.serviceCategories[0] || 'General',
      description: description || 'High-quality completed service work',
    };

    profile.portfolio.push(newItem);
    await profile.save();

    res.json({
      success: true,
      message: 'Portfolio item added successfully',
      data: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitVerification = async (req, res) => {
  try {
    const { docType, docUrl } = req.body;

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    const newDoc = {
      docType: docType || 'Government ID / Business License',
      docUrl: docUrl || req.file?.path || '/uploads/sample_id.pdf',
    };

    profile.verificationDocs.push(newDoc);
    profile.verificationStatus = 'pending';
    await profile.save();

    res.json({
      success: true,
      message: 'Verification document submitted successfully. Under admin review.',
      data: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProviderRequests = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const categories = profile ? profile.serviceCategories : [];

    const query = {
      status: { $in: ['open', 'quoted'] },
    };

    if (categories.length > 0) {
      query.category = { $in: categories.map(c => new RegExp(c, 'i')) };
    }

    const requests = await ServiceRequest.find(query)
      .populate('customerId', 'name phone location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

