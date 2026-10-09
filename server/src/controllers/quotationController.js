const Quotation = require('../models/Quotation');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const ProviderProfile = require('../models/ProviderProfile');

exports.createQuotation = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { proposedPrice, workDescription, estimatedDuration, proposedAppointment } = req.body;

    if (!proposedPrice || !workDescription || !proposedAppointment) {
      return res.status(400).json({ success: false, error: 'Please provide proposedPrice, workDescription, and proposedAppointment.' });
    }

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    if (serviceRequest.status === 'booked' || serviceRequest.status === 'completed' || serviceRequest.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'This request is no longer accepting new quotations.' });
    }

    // Check if provider has already submitted a quotation for this request
    const existingQuotation = await Quotation.findOne({ requestId, providerId: req.user._id });
    if (existingQuotation) {
      return res.status(400).json({ success: false, error: 'You have already submitted a quotation for this request.' });
    }

    const quotation = await Quotation.create({
      requestId,
      providerId: req.user._id,
      proposedPrice: Number(proposedPrice),
      workDescription,
      estimatedDuration: estimatedDuration || '1-2 hours',
      proposedAppointment: new Date(proposedAppointment),
      status: 'pending',
    });

    // Update request status to quoted if currently open
    if (serviceRequest.status === 'open') {
      serviceRequest.status = 'quoted';
      await serviceRequest.save();
    }

    // Notify customer
    await Notification.create({
      recipientId: serviceRequest.customerId,
      type: 'NEW_QUOTATION',
      message: `You received a new quotation of ₹${proposedPrice} for "${serviceRequest.title}".`,
      relatedEntityId: quotation._id,
    });

    res.status(201).json({
      success: true,
      data: quotation,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getQuotationsForRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const serviceRequest = await ServiceRequest.findById(requestId);

    if (!serviceRequest) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    const quotations = await Quotation.find({ requestId })
      .populate('providerId', 'name email phone location')
      .sort({ proposedPrice: 1 });

    // Attach provider profiles
    const populated = await Promise.all(
      quotations.map(async (q) => {
        const qObj = q.toObject();
        const profile = await ProviderProfile.findOne({ userId: q.providerId._id });
        qObj.providerProfile = profile;
        return qObj;
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

exports.getProviderQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ providerId: req.user._id })
      .populate('requestId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotations.length,
      data: quotations,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, error: 'Quotation not found.' });
    }

    if (quotation.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this quotation.' });
    }

    if (quotation.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Cannot modify a non-pending quotation.' });
    }

    const { proposedPrice, workDescription, estimatedDuration, proposedAppointment } = req.body;
    if (proposedPrice) quotation.proposedPrice = Number(proposedPrice);
    if (workDescription) quotation.workDescription = workDescription;
    if (estimatedDuration) quotation.estimatedDuration = estimatedDuration;
    if (proposedAppointment) quotation.proposedAppointment = new Date(proposedAppointment);

    await quotation.save();

    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.acceptQuotation = async (req, res) => {
  try {
    const quotationId = req.params.id;
    const quotation = await Quotation.findById(quotationId).populate('requestId');

    if (!quotation) {
      return res.status(404).json({ success: false, error: 'Quotation not found.' });
    }

    const serviceRequest = await ServiceRequest.findById(quotation.requestId._id);

    // Verify ownership
    if (serviceRequest.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the request creator can accept a quotation.' });
    }

    // Check if request is already booked
    if (serviceRequest.status === 'booked' || serviceRequest.status === 'completed') {
      return res.status(400).json({ success: false, error: 'This service request has already been booked with a provider.' });
    }

    const existingBooking = await Booking.findOne({ requestId: serviceRequest._id, status: { $ne: 'cancelled' } });
    if (existingBooking) {
      return res.status(400).json({ success: false, error: 'A booking already exists for this service request.' });
    }

    // Accept this quotation, reject others for the same request
    quotation.status = 'accepted';
    await quotation.save();

    await Quotation.updateMany(
      { requestId: serviceRequest._id, _id: { $ne: quotation._id } },
      { status: 'rejected' }
    );

    // Update request status
    serviceRequest.status = 'booked';
    await serviceRequest.save();

    // Create booking entry
    const booking = await Booking.create({
      requestId: serviceRequest._id,
      customerId: serviceRequest.customerId,
      providerId: quotation.providerId,
      quotationId: quotation._id,
      agreedPrice: quotation.proposedPrice,
      scheduledAt: quotation.proposedAppointment || serviceRequest.preferredDate,
      serviceAddress: serviceRequest.serviceLocation,
      status: 'confirmed',
    });

    // Send notifications
    await Notification.create({
      recipientId: quotation.providerId,
      type: 'QUOTATION_ACCEPTED',
      message: `Your quotation of ₹${quotation.proposedPrice} for "${serviceRequest.title}" was accepted!`,
      relatedEntityId: booking._id,
    });

    res.status(201).json({
      success: true,
      message: 'Quotation accepted and booking confirmed successfully.',
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
