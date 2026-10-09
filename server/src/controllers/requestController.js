const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { category, title, description, photoUrls, serviceLocation, preferredDate, urgency } = req.body;

    if (!category || !title || !description || !serviceLocation || !preferredDate) {
      return res.status(400).json({ success: false, error: 'Please provide category, title, description, serviceLocation, and preferredDate.' });
    }

    const serviceReq = await ServiceRequest.create({
      customerId: req.user._id,
      category,
      title,
      description,
      photoUrls: photoUrls || [],
      serviceLocation,
      preferredDate: new Date(preferredDate),
      urgency: urgency || 'medium',
      status: 'open',
    });

    res.status(201).json({
      success: true,
      data: serviceReq,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { category, city, status, urgency } = req.query;

    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      // Providers see open or quoted requests
      query.status = status ? status : { $in: ['open', 'quoted'] };
    }

    if (category) query.category = { $regex: new RegExp(category, 'i') };
    if (city) query['serviceLocation.city'] = { $regex: new RegExp(city, 'i') };
    if (urgency) query.urgency = urgency;

    const requests = await ServiceRequest.find(query)
      .populate('customerId', 'name email phone location')
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

exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customerId', 'name email phone location');

    if (!request) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    // Ownership & permission check
    if (req.user.role === 'customer' && request.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this request.' });
    }

    const quotations = await Quotation.find({ requestId: request._id })
      .populate('providerId', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: request,
      quotations,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    if (request.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this request.' });
    }

    const { title, description, serviceLocation, preferredDate, urgency } = req.body;
    if (title) request.title = title;
    if (description) request.description = description;
    if (serviceLocation) request.serviceLocation = serviceLocation;
    if (preferredDate) request.preferredDate = new Date(preferredDate);
    if (urgency) request.urgency = urgency;

    await request.save();

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    if (request.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to change status.' });
    }

    const validStatuses = ['open', 'quoted', 'booked', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status provided.' });
    }

    request.status = status;
    await request.save();

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
