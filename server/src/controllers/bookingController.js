const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const ProviderProfile = require('../models/ProviderProfile');

exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    }

    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('requestId', 'title category description urgency photoUrls')
      .populate('customerId', 'name email phone location')
      .populate('providerId', 'name email phone location')
      .populate('quotationId', 'proposedPrice workDescription estimatedDuration')
      .sort({ createdAt: -1 });

    // Attach provider details
    const populated = await Promise.all(
      bookings.map(async (b) => {
        const bObj = b.toObject();
        if (b.providerId) {
          const profile = await ProviderProfile.findOne({ userId: b.providerId._id });
          bObj.providerProfile = profile;
        }
        return bObj;
      })
    );

    res.json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('requestId')
      .populate('customerId', 'name email phone location')
      .populate('providerId', 'name email phone location')
      .populate('quotationId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Permission check
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider = booking.providerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this booking.' });
    }

    const bObj = booking.toObject();
    const profile = await ProviderProfile.findOne({ userId: booking.providerId._id });
    bObj.providerProfile = profile;

    res.json({ success: true, data: bObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isProvider = booking.providerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this booking.' });
    }

    const validStatuses = ['confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid booking status.' });
    }

    booking.status = status;
    booking.statusHistory = booking.statusHistory || [];
    booking.statusHistory.push({ status, updatedAt: new Date() });

    if (status === 'completed') {
      booking.completedAt = new Date();
      // Increment provider completedJobsCount
      await ProviderProfile.updateOne(
        { userId: booking.providerId },
        { $inc: { completedJobsCount: 1 } }
      );
    }

    await booking.save();

    // Sync status to linked ServiceRequest
    const serviceRequest = await ServiceRequest.findById(booking.requestId);
    if (serviceRequest) {
      if (status === 'completed') serviceRequest.status = 'completed';
      if (status === 'in_progress' || status === 'on_the_way') serviceRequest.status = 'in_progress';
      if (status === 'cancelled') serviceRequest.status = 'cancelled';
      await serviceRequest.save();
    }

    // Notify partner
    const notifyRecipient = isProvider ? booking.customerId : booking.providerId;
    await Notification.create({
      recipientId: notifyRecipient,
      type: 'BOOKING_STATUS_UPDATE',
      message: `Booking for "${serviceRequest?.title || 'service'}" status changed to ${status.replace('_', ' ')}.`,
      relatedEntityId: booking._id,
    });

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isProvider = booking.providerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this booking.' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Cannot cancel a completed booking.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const serviceRequest = await ServiceRequest.findById(booking.requestId);
    if (serviceRequest) {
      serviceRequest.status = 'open';
      await serviceRequest.save();
    }

    res.json({ success: true, message: 'Booking cancelled successfully.', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
