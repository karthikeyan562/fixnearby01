const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fixnearby_super_secret_jwt_key_2026', {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, businessName, serviceCategories } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Role safety: Users cannot self-register as admin
    const assignedRole = role === 'provider' ? 'provider' : 'customer';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      phone: phone || '',
      location: location || { city: '', locality: '', postalCode: '' },
    });

    let profile = null;
    if (assignedRole === 'provider') {
      profile = await ProviderProfile.create({
        userId: user._id,
        businessName: businessName || `${user.name}'s Services`,
        serviceCategories: serviceCategories || ['General Maintenance'],
        serviceAreas: user.location?.city ? [{ city: user.location.city, locality: user.location.locality, postalCode: user.location.postalCode }] : [],
        verificationStatus: 'unverified',
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      accountStatus: user.accountStatus,
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      providerProfile: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ success: false, error: 'Account has been suspended by administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    let profile = null;
    if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ userId: user._id });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      accountStatus: user.accountStatus,
    };

    res.json({
      success: true,
      token,
      user: userResponse,
      providerProfile: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    let profile = null;
    if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ userId: user._id });
    }
    res.json({
      success: true,
      user,
      providerProfile: profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
