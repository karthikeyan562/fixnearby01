const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Report = require('../models/Report');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalRequests = await ServiceRequest.countDocuments();
    const activeRequests = await ServiceRequest.countDocuments({ status: { $in: ['open', 'quoted'] } });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingVerifications = await ProviderProfile.countDocuments({ verificationStatus: 'pending' });
    const verifiedProviders = await ProviderProfile.countDocuments({ verificationStatus: 'verified' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    const totalGrossRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$agreedPrice' } } },
    ]);

    const revenueSum = totalGrossRevenue.length > 0 ? totalGrossRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalRequests,
        activeRequests,
        totalBookings,
        completedBookings,
        pendingVerifications,
        verifiedProviders,
        pendingReports,
        revenueSum,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPendingProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone location createdAt');

    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyProvider = async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be verified or rejected.' });
    }

    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    profile.verificationStatus = status;
    await profile.save();

    res.json({
      success: true,
      message: `Provider verification status updated to ${status}.`,
      data: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { accountStatus } = req.body; // 'active' or 'suspended'
    if (!['active', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Admin accounts cannot be suspended.' });
    }

    user.accountStatus = accountStatus;
    await user.save();

    res.json({ success: true, message: `User account status updated to ${accountStatus}.`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, listingId, reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({ success: false, error: 'Please provide reason and description.' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUserId,
      listingId,
      reason,
      description,
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully.', data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedUserId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'reviewed', 'resolved', 'dismissed'
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    report.status = status;
    await report.save();

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
