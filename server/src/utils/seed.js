const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Report = require('../models/Report');

async function seedData() {
  console.log('[Seed] Starting database seeding process...');

  // Clear existing collections
  await User.deleteMany({});
  await ProviderProfile.deleteMany({});
  await ServiceRequest.deleteMany({});
  await Quotation.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Report.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('password123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  // 1. Create Admin
  const admin = await User.create({
    name: 'FixNearby Master Admin',
    email: 'admin@fixnearby.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    phone: '+91 98765 00000',
    location: { city: 'Coimbatore', locality: 'Gandhipuram', postalCode: '641012' },
  });

  // 2. Create Customers
  const customer1 = await User.create({
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    passwordHash: commonPasswordHash,
    role: 'customer',
    phone: '+91 98421 11111',
    location: { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002' },
  });

  const customer2 = await User.create({
    name: 'Priya Sundaram',
    email: 'priya@example.com',
    passwordHash: commonPasswordHash,
    role: 'customer',
    phone: '+91 98421 22222',
    location: { city: 'Coimbatore', locality: 'Peelamedu', postalCode: '641004' },
  });

  const customer3 = await User.create({
    name: 'Karthik Subramanian',
    email: 'karthik@example.com',
    passwordHash: commonPasswordHash,
    role: 'customer',
    phone: '+91 98421 33333',
    location: { city: 'Chennai', locality: 'T Nagar', postalCode: '600017' },
  });

  // 3. Create Providers & Profiles
  const providerData = [
    {
      user: {
        name: 'Suresh Electric Works',
        email: 'suresh.elec@example.com',
        phone: '+91 94430 10101',
        location: { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002' },
      },
      profile: {
        businessName: 'Suresh Electricals & Wiring',
        businessPhone: '+91 94430 10101',
        biography: 'Over 10 years of professional experience in residential electrical wiring, MCB replacements, inverter installations, and short-circuit troubleshooting.',
        serviceCategories: ['Electrician'],
        skills: ['MCB Switchboard Repair', '3-Phase House Wiring', 'Inverter & Battery Setup', 'LED Lighting Design', 'Emergency Short Circuit Fix'],
        languages: ['English', 'Tamil'],
        serviceAreas: [
          { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002' },
          { city: 'Coimbatore', locality: 'Gandhipuram', postalCode: '641012' },
        ],
        experienceYears: 10,
        completedJobsCount: 142,
        indicativePriceRange: { min: 300, max: 2500 },
        verificationStatus: 'verified',
        averageRating: 4.8,
        reviewCount: 24,
        portfolio: [
          { imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', title: 'Smart Distribution Board Installation', category: 'Electrician', description: 'Replaced faulty fuse box with 8-way Schneider MCB panel.' },
          { imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', title: 'Full Home Concealed Wiring', category: 'Electrician', description: 'Complete 3BHK copper wiring installation.' }
        ]
      },
    },
    {
      user: {
        name: 'Murugan Plumbing Care',
        email: 'murugan.plumb@example.com',
        phone: '+91 94430 20202',
        location: { city: 'Coimbatore', locality: 'Peelamedu', postalCode: '641004' },
      },
      profile: {
        businessName: 'Murugan Plumbing & Sanitation Services',
        businessPhone: '+91 94430 20202',
        biography: 'Licensed plumbing specialist for pipe leakage repair, tap fixing, bathroom fitting installation, motor repair, and drain unclogging.',

        serviceCategories: ['Plumber'],
        skills: ['Overhead Tank Pipe Fitting', 'Drainage Unclogging', 'Water Motor Pump Repair', 'Sanitaryware Fitting', 'Leakage Detection'],
        languages: ['English', 'Tamil'],
        serviceAreas: [
          { city: 'Coimbatore', locality: 'Peelamedu', postalCode: '641004' },
          { city: 'Coimbatore', locality: 'Singanallur', postalCode: '641005' },
        ],
        experienceYears: 8,
        completedJobsCount: 98,
        indicativePriceRange: { min: 250, max: 1800 },
        verificationStatus: 'verified',
        averageRating: 4.7,
        reviewCount: 19,
        portfolio: [
          { imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', title: 'Modern Bathroom Plumbing & Diverter', category: 'Plumber', description: 'Installed concealed thermostatic divertor and rain shower.' }
        ]
      },
    },
    {
      user: {
        name: 'Apex AC Cool Tech',
        email: 'apex.ac@example.com',
        phone: '+91 94430 30303',
        location: { city: 'Coimbatore', locality: 'Gandhipuram', postalCode: '641012' },
      },
      profile: {
        businessName: 'Apex Air Conditioning & Refrigeration',
        biography: 'Certified AC repair technician specializing in split & window AC servicing, gas charging, compressor replacement, and deep foam cleaning.',
        serviceCategories: ['AC Technician', 'Appliance Repair'],
        skills: ['Jet Foam AC Service', 'R32 / R410 Gas Charging', 'Outdoor Unit Mounting', 'Copper Piping & Insulation'],
        languages: ['English', 'Tamil', 'Hindi'],
        serviceAreas: [
          { city: 'Coimbatore', locality: 'Gandhipuram', postalCode: '641012' },
          { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002' },
          { city: 'Coimbatore', locality: 'Peelamedu', postalCode: '641004' },
        ],
        experienceYears: 6,
        completedJobsCount: 210,
        indicativePriceRange: { min: 499, max: 3500 },
        verificationStatus: 'verified',
        averageRating: 4.9,
        reviewCount: 31,
        portfolio: [
          { imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', title: 'Dual Inverter Split AC Gas Refill & Servicing', category: 'AC Technician', description: 'Restored 100% cooling efficiency for 2 Ton Inverter Split AC.' }
        ]
      },
    },
    {
      user: {
        name: 'Kovai Home Appliances',
        email: 'kovai.repair@example.com',
        phone: '+91 94430 40404',
        location: { city: 'Coimbatore', locality: 'Saravanampatti', postalCode: '641035' },
      },
      profile: {
        businessName: 'Kovai Washing Machine & Fridge Clinic',
        biography: 'Expert technician for front/top load washing machines, refrigerators, microwave ovens, and TV repairs with 100% genuine spare parts.',
        serviceCategories: ['Appliance Repair'],
        skills: ['Front Load Drum Bearing Fix', 'Double Door Refrigerator Thermostat Repair', 'PCB Board Micro-soldering'],
        languages: ['English', 'Tamil'],
        serviceAreas: [
          { city: 'Coimbatore', locality: 'Saravanampatti', postalCode: '641035' },
          { city: 'Coimbatore', locality: 'Peelamedu', postalCode: '641004' },
        ],
        experienceYears: 7,
        completedJobsCount: 86,
        indicativePriceRange: { min: 350, max: 2200 },
        verificationStatus: 'verified',
        averageRating: 4.6,
        reviewCount: 15,
      },
    },
    {
      user: {
        name: 'Velu Craftsman',
        email: 'velu.carpenter@example.com',
        phone: '+91 94430 50505',
        location: { city: 'Chennai', locality: 'T Nagar', postalCode: '600017' },
      },
      profile: {
        businessName: 'Velu Wooden Works & Modular Furniture',
        biography: 'Custom woodworking, door latch fixing, modular kitchen cabinet repair, sofa restoration, and furniture assembly.',
        serviceCategories: ['Carpenter'],
        skills: ['Modular Kitchen Hinge Replacement', 'Teak Wood Door Fitting', 'Custom Wardrobe Shelving'],
        languages: ['English', 'Tamil'],
        serviceAreas: [
          { city: 'Chennai', locality: 'T Nagar', postalCode: '600017' },
          { city: 'Chennai', locality: 'Adyar', postalCode: '600020' },
        ],
        experienceYears: 12,
        completedJobsCount: 175,
        indicativePriceRange: { min: 400, max: 4000 },
        verificationStatus: 'pending',
        verificationDocs: [{ docType: 'Trade License', docUrl: '/uploads/sample_license.pdf' }],
        averageRating: 4.5,
        reviewCount: 8,
      },
    },
    {
      user: {
        name: 'Rainbow Colors Painting',
        email: 'rainbow.paint@example.com',
        phone: '+91 94430 60606',
        location: { city: 'Coimbatore', locality: 'Ramanathapuram', postalCode: '641045' },
      },
      profile: {
        businessName: 'Rainbow Premium Painting Services',
        biography: 'Interior and exterior wall painting, waterproof coating, texture designs, and dampness restoration.',
        serviceCategories: ['Painter'],
        skills: ['Waterproof Wall Putty', 'Royal Emulsion Finish', 'Texture Wall Design'],
        languages: ['English', 'Tamil'],
        serviceAreas: [
          { city: 'Coimbatore', locality: 'Ramanathapuram', postalCode: '641045' },
        ],
        experienceYears: 5,
        completedJobsCount: 45,
        indicativePriceRange: { min: 800, max: 15000 },
        verificationStatus: 'unverified',
        averageRating: 4.0,
        reviewCount: 4,
      },
    },
  ];

  const createdProviders = [];
  for (const item of providerData) {
    const user = await User.create({
      ...item.user,
      passwordHash: commonPasswordHash,
      role: 'provider',
    });
    const profile = await ProviderProfile.create({
      ...item.profile,
      userId: user._id,
    });
    createdProviders.push({ user, profile });
  }

  // 4. Create Service Requests
  const request1 = await ServiceRequest.create({
    customerId: customer1._id,
    category: 'Electrician',
    title: 'Main Switch Board Sparking & Tripping MCB',
    description: 'The main MCB in our living room trips continuously whenever the air conditioner is turned on. Need an expert electrician urgently to inspect wiring and replace damaged breaker.',
    photoUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'],
    serviceLocation: { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002', address: 'Door No 45, DB Road, RS Puram' },
    preferredDate: new Date(Date.now() + 86400000),
    urgency: 'high',
    status: 'quoted',
  });

  const request2 = await ServiceRequest.create({
    customerId: customer2._id,
    category: 'AC Technician',
    title: 'Split AC Deep Cleaning & Water Leakage Fix',
    description: '1.5 Ton Inverter AC indoor unit is dripping water on the bedroom wall. Cooling efficiency has also reduced significantly. Needs foam jet wash and drain pipe inspection.',
    photoUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
    serviceLocation: { city: 'Coimbatore', locality: 'Peelamedu', postalCode: '641004', address: 'Flat 302, Green Avenue, Peelamedu' },
    preferredDate: new Date(Date.now() + 172800000),
    urgency: 'medium',
    status: 'open',
  });

  const request3 = await ServiceRequest.create({
    customerId: customer1._id,
    category: 'Plumber',
    title: 'Bathroom Sink Water Leakage & Tap Replacement',
    description: 'Old brass tap in the master bathroom is rusted and leaking continuously. Need replacement with new stainless steel pillar tap.',
    photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
    serviceLocation: { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002', address: 'Door No 45, DB Road, RS Puram' },
    preferredDate: new Date(Date.now() - 259200000),
    urgency: 'medium',
    status: 'completed',
  });

  // 5. Create Quotation
  const quote1 = await Quotation.create({
    requestId: request1._id,
    providerId: createdProviders[0].user._id, // Suresh Electric Works
    proposedPrice: 450,
    workDescription: 'Inspect main breaker box, test load balancing, replace 32A MCB switch with Schneider dual-pole breaker, and insulate wiring joints.',
    estimatedDuration: '1.5 hours',
    proposedAppointment: new Date(Date.now() + 86400000),
    status: 'pending',
  });

  const quote2 = await Quotation.create({
    requestId: request1._id,
    providerId: createdProviders[2].user._id, // Apex AC / Elec
    proposedPrice: 550,
    workDescription: 'Comprehensive load testing with digital clamp meter, MCB switch replacement, and terminal tightening.',
    estimatedDuration: '1 hour',
    proposedAppointment: new Date(Date.now() + 90000000),
    status: 'pending',
  });

  // 6. Create Completed Booking & Review for Request 3
  const completedQuote = await Quotation.create({
    requestId: request3._id,
    providerId: createdProviders[1].user._id, // Murugan Plumbing
    proposedPrice: 350,
    workDescription: 'Fixed leaking pipe joint under sink and installed new heavy-duty brass tap.',
    estimatedDuration: '1 hour',
    proposedAppointment: new Date(Date.now() - 259200000),
    status: 'accepted',
  });

  const completedBooking = await Booking.create({
    requestId: request3._id,
    customerId: customer1._id,
    providerId: createdProviders[1].user._id,
    quotationId: completedQuote._id,
    agreedPrice: 350,
    scheduledAt: new Date(Date.now() - 259200000),
    serviceAddress: request3.serviceLocation,
    status: 'completed',
    completedAt: new Date(Date.now() - 240000000),
  });

  await Review.create({
    bookingId: completedBooking._id,
    customerId: customer1._id,
    providerId: createdProviders[1].user._id,
    rating: 5,
    reviewText: 'Murugan arrived right on time! Very polite, diagnosed the leaking sink immediately, and completed the tap replacement neatly without any mess. Highly recommended plumber in Coimbatore!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    videoDuration: '0:15',
    serviceCategory: 'Plumber',
    customerLocation: 'RS Puram, Coimbatore',
    isFeatured: true,
    moderationStatus: 'approved',
  });


  // 7. Create Sample Report
  await Report.create({
    reporterId: customer2._id,
    reportedUserId: createdProviders[5].user._id,
    reason: 'Incomplete Pricing Details',
    description: 'Provider listed very broad pricing range without clear service descriptions.',
    status: 'pending',
  });

  console.log('[Seed] Database successfully populated with initial seed records!');
}

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    try {
      await connectDB();
      await seedData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]', err);
      process.exit(1);
    }
  })();
}

module.exports = seedData;
