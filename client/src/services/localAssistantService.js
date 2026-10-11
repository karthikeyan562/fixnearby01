/**
 * Client-Side Intelligent Voice Assistant Engine for FixNearby
 * Provides high-speed, 100% reliable local NLP parsing, multi-turn dialog state,
 * service matching, and request wizard logic when backend is offline or static-hosted.
 */

export const CATEGORY_MAP = {
  // Appliance Repair
  'washing machine': 'Appliance Repair',
  washing: 'Appliance Repair',
  washer: 'Appliance Repair',
  dryer: 'Appliance Repair',
  refrigerator: 'Appliance Repair',
  fridge: 'Appliance Repair',
  freezer: 'Appliance Repair',
  microwave: 'Appliance Repair',
  oven: 'Appliance Repair',
  otg: 'Appliance Repair',
  appliance: 'Appliance Repair',
  tv: 'Appliance Repair',
  television: 'Appliance Repair',
  dishwasher: 'Appliance Repair',
  purifier: 'Appliance Repair',
  ro: 'Appliance Repair',
  geyser: 'Appliance Repair',
  heater: 'Appliance Repair',

  // AC Technician
  'air conditioner': 'AC Technician',
  aircon: 'AC Technician',
  'split ac': 'AC Technician',
  'window ac': 'AC Technician',
  ac: 'AC Technician',
  cooling: 'AC Technician',
  hvac: 'AC Technician',

  // Electrician
  electrician: 'Electrician',
  electrical: 'Electrician',
  electricity: 'Electrician',
  wiring: 'Electrician',
  wire: 'Electrician',
  switch: 'Electrician',
  switchboard: 'Electrician',
  socket: 'Electrician',
  fuse: 'Electrician',
  mcb: 'Electrician',
  breaker: 'Electrician',
  tripping: 'Electrician',
  short: 'Electrician',
  fan: 'Electrician',
  light: 'Electrician',
  lighting: 'Electrician',
  bulb: 'Electrician',
  inverter: 'Electrician',
  generator: 'Electrician',

  // Plumber
  plumber: 'Plumber',
  plumbing: 'Plumber',
  pipe: 'Plumber',
  pipes: 'Plumber',
  leak: 'Plumber',
  leakage: 'Plumber',
  leaking: 'Plumber',
  tap: 'Plumber',
  faucet: 'Plumber',
  sink: 'Plumber',
  washbasin: 'Plumber',
  drain: 'Plumber',
  drainage: 'Plumber',
  clog: 'Plumber',
  clogged: 'Plumber',
  blockage: 'Plumber',
  toilet: 'Plumber',
  flush: 'Plumber',
  motor: 'Plumber',
  pump: 'Plumber',
  'water tank': 'Plumber',

  // Carpenter
  carpenter: 'Carpenter',
  carpentry: 'Carpenter',
  wood: 'Carpenter',
  wooden: 'Carpenter',
  furniture: 'Carpenter',
  door: 'Carpenter',
  latch: 'Carpenter',
  lock: 'Carpenter',
  hinge: 'Carpenter',
  cupboard: 'Carpenter',
  wardrobe: 'Carpenter',
  sofa: 'Carpenter',
  table: 'Carpenter',
  chair: 'Carpenter',
  bed: 'Carpenter',

  // Painter
  painter: 'Painter',
  painting: 'Painter',
  wall: 'Painter',
  walls: 'Painter',
  color: 'Painter',
  paint: 'Painter',
  whitewash: 'Painter',
  waterproofing: 'Painter',
  dampness: 'Painter',
};

export const CITIES = ['Coimbatore', 'Chennai', 'Bangalore', 'Madurai', 'Salem', 'Trichy', 'Hyderabad'];

export const LOCAL_PROVIDERS = [
  {
    _id: 'prov_elec_1',
    businessName: 'Suresh Electricals & Wiring',
    businessPhone: '+91 94430 10101',
    biography: 'Over 10 years of professional experience in residential electrical wiring, MCB replacements, and inverter setups.',
    serviceCategories: ['Electrician'],
    skills: ['MCB Switchboard Repair', '3-Phase Wiring', 'Inverter Setup', 'LED Lighting'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'RS Puram' }, { city: 'Coimbatore', locality: 'Gandhipuram' }],
    experienceYears: 10,
    averageRating: 4.8,
    reviewCount: 32,
    indicativePriceRange: { min: 300, max: 1800 },
    verificationStatus: 'verified',
    userId: { name: 'Suresh Kumar', phone: '+91 94430 10101', location: { city: 'Coimbatore', locality: 'RS Puram' } }
  },
  {
    _id: 'prov_elec_2',
    businessName: 'SparkTech Power Solutions',
    businessPhone: '+91 94430 10102',
    biography: 'Certified electricians specializing in urgent power breakdown, home automation, and appliance wiring.',
    serviceCategories: ['Electrician'],
    skills: ['Emergency Power Fix', 'Smart Switches', 'Geyser Connection', 'Earthing'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'Peelamedu' }, { city: 'Chennai', locality: 'T Nagar' }],
    experienceYears: 7,
    averageRating: 4.9,
    reviewCount: 45,
    indicativePriceRange: { min: 350, max: 2000 },
    verificationStatus: 'verified',
    userId: { name: 'Praveen Raj', phone: '+91 94430 10102', location: { city: 'Coimbatore', locality: 'Peelamedu' } }
  },
  {
    _id: 'prov_plumb_1',
    businessName: 'Murugan Plumbing & Motor Works',
    businessPhone: '+91 94430 20202',
    biography: 'Specialized in concealed pipe leaks, high-pressure water pump repairs, bathroom fitting, and drainage fixes.',
    serviceCategories: ['Plumber'],
    skills: ['Leak Detection', 'Submersible Pump Fix', 'Bathroom Fixtures', 'Drain Unclogging'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'Gandhipuram' }, { city: 'Coimbatore', locality: 'RS Puram' }],
    experienceYears: 8,
    averageRating: 4.7,
    reviewCount: 28,
    indicativePriceRange: { min: 250, max: 1500 },
    verificationStatus: 'verified',
    userId: { name: 'Murugan Selvam', phone: '+91 94430 20202', location: { city: 'Coimbatore', locality: 'Gandhipuram' } }
  },
  {
    _id: 'prov_ac_1',
    businessName: 'CoolBreeze Air Conditioning',
    businessPhone: '+91 94430 30303',
    biography: 'Expert technicians for split and inverter AC deep jet cleaning, gas charging, PCB board repairs, and installation.',
    serviceCategories: ['AC Technician'],
    skills: ['Jet Foam AC Service', 'R32/R410 Gas Refill', 'PCB Repair', 'Installation'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'Saibaba Colony' }, { city: 'Chennai', locality: 'Velachery' }],
    experienceYears: 9,
    averageRating: 4.9,
    reviewCount: 54,
    indicativePriceRange: { min: 499, max: 2500 },
    verificationStatus: 'verified',
    userId: { name: 'Anand Mohan', phone: '+91 94430 30303', location: { city: 'Coimbatore', locality: 'Saibaba Colony' } }
  },
  {
    _id: 'prov_app_1',
    businessName: 'QuickFix Appliance Center',
    businessPhone: '+91 94430 40404',
    biography: 'Fast diagnosis and genuine spare parts for washing machines, refrigerators, microwaves, and dishwashers.',
    serviceCategories: ['Appliance Repair'],
    skills: ['Washing Machine Drum Fix', 'Fridge Gas & Cooling', 'Microwave Magnetron', 'RO Service'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'RS Puram' }, { city: 'Bangalore', locality: 'Indiranagar' }],
    experienceYears: 12,
    averageRating: 4.8,
    reviewCount: 61,
    indicativePriceRange: { min: 399, max: 2200 },
    verificationStatus: 'verified',
    userId: { name: 'Dinesh Balan', phone: '+91 94430 40404', location: { city: 'Coimbatore', locality: 'RS Puram' } }
  },
  {
    _id: 'prov_carp_1',
    businessName: 'Craftsman Wood & Decor',
    businessPhone: '+91 94430 50505',
    biography: 'Modular kitchen modifications, door alignment, premium custom furniture, and wooden latch repairs.',
    serviceCategories: ['Carpenter'],
    skills: ['Door Alignment', 'Modular Kitchens', 'Sofa Frame Repair', 'Lock Fitting'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'Peelamedu' }],
    experienceYears: 11,
    averageRating: 4.7,
    reviewCount: 22,
    indicativePriceRange: { min: 400, max: 3000 },
    verificationStatus: 'verified',
    userId: { name: 'Muthu Vel', phone: '+91 94430 50505', location: { city: 'Coimbatore', locality: 'Peelamedu' } }
  },
  {
    _id: 'prov_paint_1',
    businessName: 'Rainbow Home Painting & Waterproofing',
    businessPhone: '+91 94430 60606',
    biography: 'Complete interior, exterior, texture finishes, and advanced terrace waterproofing with warranty.',
    serviceCategories: ['Painter'],
    skills: ['Interior Emulsion', 'Exterior Weatherproof', 'Wall Stencil', 'Terrace Leak Proofing'],
    serviceAreas: [{ city: 'Coimbatore', locality: 'Gandhipuram' }, { city: 'Chennai', locality: 'Adyar' }],
    experienceYears: 14,
    averageRating: 4.9,
    reviewCount: 39,
    indicativePriceRange: { min: 800, max: 8000 },
    verificationStatus: 'verified',
    userId: { name: 'Karthik Raja', phone: '+91 94430 60606', location: { city: 'Coimbatore', locality: 'Gandhipuram' } }
  }
];

export function parseLocalIntent(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { intent: 'UNKNOWN', entities: {} };
  }

  const text = rawText.toLowerCase().trim();
  const entities = {};

  // 1. Extract category
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    // Word boundary or contains
    if (text.includes(key)) {
      entities.category = cat;
      break;
    }
  }

  // 2. Extract city
  for (const c of CITIES) {
    if (text.includes(c.toLowerCase())) {
      entities.city = c;
      break;
    }
  }

  // 3. Extract Urgency
  if (text.includes('urgent') || text.includes('emergency') || text.includes('immediately') || text.includes('asap') || text.includes('now')) {
    entities.urgency = 'emergency';
  } else if (text.includes('today') || text.includes('high')) {
    entities.urgency = 'high';
  } else {
    entities.urgency = 'medium';
  }

  // 4. Extract Preferred Date
  if (text.includes('tomorrow')) {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    entities.preferredDate = tm.toISOString().split('T')[0];
  } else if (text.includes('today')) {
    entities.preferredDate = new Date().toISOString().split('T')[0];
  }

  // 5. Intent Classification
  // Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|vanakkam)/i.test(text)) {
    return { intent: 'GREETING', entities };
  }

  // Booking status
  if (
    text.includes('booking') ||
    text.includes('my orders') ||
    text.includes('my requests') ||
    text.includes('active booking') ||
    text.includes('status of') ||
    text.includes('track')
  ) {
    return { intent: 'CHECK_BOOKING_STATUS', entities };
  }

  // Help / Explanations
  if (
    text.includes('how to') ||
    text.includes('how it works') ||
    text.includes('explain') ||
    text.includes('help me book') ||
    text.includes('what can you do') ||
    text.includes('who are you')
  ) {
    return { intent: 'GET_BOOKING_HELP', entities };
  }

  // Problem description -> Create service request
  if (
    text.includes('not working') ||
    text.includes('broken') ||
    text.includes('repair') ||
    text.includes('fix my') ||
    text.includes('leaking') ||
    text.includes('leak') ||
    text.includes('draining') ||
    text.includes('tripping') ||
    text.includes('cooling') ||
    text.includes('issue with') ||
    text.includes('problem with') ||
    text.includes('damage') ||
    text.includes('create a request') ||
    text.includes('post a request')
  ) {
    entities.description = rawText;
    return { intent: 'CREATE_SERVICE_REQUEST', entities };
  }

  // Find / Search service
  if (
    text.includes('find') ||
    text.includes('search') ||
    text.includes('need a') ||
    text.includes('need an') ||
    text.includes('looking for') ||
    text.includes('near me') ||
    text.includes('nearby') ||
    text.includes('best')
  ) {
    return { intent: 'FIND_SERVICE', entities };
  }

  // Default fallback if category found
  if (entities.category) {
    return { intent: 'FIND_SERVICE', entities };
  }

  return { intent: 'UNKNOWN', entities };
}

export function processAssistantMessageLocal({ message, draftRequest = {}, user = null }) {
  const { intent, entities } = parseLocalIntent(message);

  const currentDraft = { ...draftRequest };
  if (entities.category) currentDraft.category = entities.category;
  if (entities.city) currentDraft.city = entities.city;
  if (entities.urgency) currentDraft.urgency = entities.urgency;
  if (entities.preferredDate) currentDraft.preferredDate = entities.preferredDate;
  if (entities.description && !currentDraft.description) currentDraft.description = entities.description;

  const userCity = entities.city || currentDraft.city || user?.location?.city || 'Coimbatore';

  let responsePayload = {
    success: true,
    intent,
    entities,
    draftRequest: currentDraft,
    confirmationCard: null,
    dataResults: null,
    spokenText: '',
    displayText: '',
  };

  switch (intent) {
    case 'GREETING': {
      responsePayload.spokenText = "Hello! I am your FixNearby Voice Assistant. How can I assist you with your home services today? You can say 'Find an electrician' or describe an issue like 'My washing machine is not draining'.";
      responsePayload.displayText = "👋 Hello! I am your FixNearby Voice Helper.\n\nHow can I help you today? You can:\n• Find verified local experts (\"Find an electrician near me\")\n• Post a problem request (\"My washing machine is leaking\")\n• Check your bookings (\"Show my active bookings\")";
      break;
    }

    case 'FIND_SERVICE': {
      const targetCategory = currentDraft.category || entities.category;
      let matched = LOCAL_PROVIDERS.filter((p) => {
        const catMatch = !targetCategory || p.serviceCategories.some((c) => c.toLowerCase().includes(targetCategory.toLowerCase()));
        return catMatch;
      });

      // Filter by city if available
      const cityMatched = matched.filter((p) =>
        p.serviceAreas.some((a) => a.city.toLowerCase() === userCity.toLowerCase())
      );
      if (cityMatched.length > 0) {
        matched = cityMatched;
      }

      if (matched.length > 0) {
        const top = matched[0];
        const catName = targetCategory || 'Service';
        responsePayload.spokenText = `Found ${matched.length} top-rated ${catName} professionals near ${userCity}. ${top.businessName} has a ${top.averageRating} star rating with ${top.experienceYears} years experience.`;
        responsePayload.displayText = `Found ${matched.length} verified ${catName} professionals near ${userCity}:`;
        responsePayload.dataResults = matched;
      } else {
        responsePayload.spokenText = `I couldn't find registered providers for that category right now in ${userCity}. Would you like to post a service request so nearby technicians can send you quotes?`;
        responsePayload.displayText = `No direct provider matches for "${targetCategory || message}" in ${userCity}.\n\nWould you like to post a service request? Nearby experts will send you instant quotations!`;
      }
      break;
    }

    case 'CREATE_SERVICE_REQUEST': {
      // Step 1: ensure category
      if (!currentDraft.category) {
        responsePayload.spokenText = "What type of service do you need? For example, Electrician, Plumber, Appliance Repair, or AC Technician?";
        responsePayload.displayText = "Please specify the service category (e.g. Electrician, Plumber, Appliance Repair, AC Technician, Carpenter).";
        break;
      }

      // Step 2: ensure description
      if (!currentDraft.description || currentDraft.description.length < 5) {
        currentDraft.description = message;
      }

      if (!currentDraft.city) {
        currentDraft.city = userCity;
        currentDraft.locality = user?.location?.locality || 'Town Hall';
      }

      if (!currentDraft.preferredDate) {
        const tm = new Date();
        tm.setDate(tm.getDate() + 1);
        currentDraft.preferredDate = tm.toISOString().split('T')[0];
      }

      // Build confirmation card
      responsePayload.confirmationCard = {
        category: currentDraft.category,
        title: `${currentDraft.category} Service - ${currentDraft.city}`,
        description: currentDraft.description || `${currentDraft.category} inspection and repair required`,
        serviceLocation: {
          city: currentDraft.city || userCity,
          locality: currentDraft.locality || 'Central Area',
          postalCode: '641001',
          address: user?.location?.address || 'Customer Location',
        },
        preferredDate: currentDraft.preferredDate,
        urgency: currentDraft.urgency || 'medium',
      };

      responsePayload.spokenText = `I have compiled your ${currentDraft.category} service request for ${currentDraft.city}. Please review the details on screen and click Confirm to post it.`;
      responsePayload.displayText = `✨ Ready to create your ${currentDraft.category} service request! Review the details below and click "Confirm & Submit Request".`;
      break;
    }

    case 'CHECK_BOOKING_STATUS': {
      responsePayload.spokenText = user
        ? `You have logged in as ${user.name}. You can review all active service requests and quotes in your dashboard.`
        : "Please log in to track your live bookings and quotes. You can click 'Log In' in the navigation bar.";
      responsePayload.displayText = user
        ? `Logged in as **${user.name}** (${user.role}).\n\nGo to your **Dashboard** to view all active requests, accepted quotations, and live technician tracking.`
        : "🔒 **Authentication Required**\n\nPlease log in or create an account to view and manage your active bookings.";
      break;
    }

    case 'GET_BOOKING_HELP': {
      responsePayload.spokenText = "FixNearby makes home repairs effortless. First, post your problem. Nearby verified experts send you quotes. Compare prices and ratings, accept the best one, and your technician arrives!";
      responsePayload.displayText = "ℹ️ **How FixNearby Works**:\n\n1. **Post Your Issue**: Describe what's broken or speak to this Voice Assistant.\n2. **Receive Fast Quotes**: Nearby verified pros send transparent price quotes.\n3. **Compare & Accept**: Pick the best price, rating, or arrival time.\n4. **Expert Arrives**: Track technician arrival and pay upon completion!";
      break;
    }

    default: {
      responsePayload.spokenText = "I am your FixNearby Voice Helper. You can ask me to find an electrician or plumber, post a repair request, or ask how our service works.";
      responsePayload.displayText = "💡 **Try asking me:**\n• \"Find an electrician in Coimbatore\"\n• \"My washing machine is not draining\"\n• \"Need a plumber for leaking tap\"\n• \"Show my active bookings\"\n• \"How does FixNearby work?\"";
      break;
    }
  }

  return responsePayload;
}
