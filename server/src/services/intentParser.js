/**
 * Intent Parser for FixNearby Voice Helper
 * Uses pattern matching and NLP heuristics to classify user prompts into structured intents and extract entities.
 */

const CATEGORY_MAP = {
  'washing machine': 'Appliance Repair',
  washing: 'Appliance Repair',
  refrigerator: 'Appliance Repair',
  fridge: 'Appliance Repair',
  microwave: 'Appliance Repair',
  appliance: 'Appliance Repair',
  tv: 'Appliance Repair',
  'air conditioner': 'AC Technician',
  aircon: 'AC Technician',
  ac: 'AC Technician',
  cooling: 'AC Technician',
  electrician: 'Electrician',
  electrical: 'Electrician',
  wiring: 'Electrician',
  switch: 'Electrician',
  fan: 'Electrician',
  light: 'Electrician',
  plumber: 'Plumber',
  plumbing: 'Plumber',
  pipe: 'Plumber',
  leak: 'Plumber',
  tap: 'Plumber',
  sink: 'Plumber',
  drain: 'Plumber',
  toilet: 'Plumber',
  carpenter: 'Carpenter',
  carpentry: 'Carpenter',
  wood: 'Carpenter',
  furniture: 'Carpenter',
  door: 'Carpenter',
  painter: 'Painter',
  painting: 'Painter',
  wall: 'Painter',
  color: 'Painter',
};

const CITY_LIST = ['Coimbatore', 'Chennai', 'Bangalore', 'Madurai', 'Trichy', 'Salem', 'Hyderabad'];

function parseIntent(text) {
  if (!text || typeof text !== 'string') {
    return { intent: 'UNKNOWN', entities: {} };
  }

  const cleanText = text.toLowerCase().trim();
  const entities = {};

  // Extract Category
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (cleanText.includes(key)) {
      entities.category = value;
      break;
    }
  }

  // Extract City
  for (const city of CITY_LIST) {
    if (cleanText.includes(city.toLowerCase())) {
      entities.city = city;
      break;
    }
  }

  // Extract Urgency
  if (cleanText.includes('emergency') || cleanText.includes('urgent') || cleanText.includes('asap') || cleanText.includes('immediately')) {
    entities.urgency = 'emergency';
  } else if (cleanText.includes('high') || cleanText.includes('today')) {
    entities.urgency = 'high';
  } else {
    entities.urgency = 'medium';
  }

  // Extract Preferred Date Heuristic
  if (cleanText.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    entities.preferredDate = tomorrow.toISOString().split('T')[0];
  } else if (cleanText.includes('today')) {
    entities.preferredDate = new Date().toISOString().split('T')[0];
  }

  // Classify Intent
  if (
    cleanText.includes('show my active bookings') ||
    cleanText.includes('show my booking') ||
    cleanText.includes('status of my service') ||
    cleanText.includes('check my booking') ||
    cleanText.includes('my bookings')
  ) {
    return { intent: 'CHECK_BOOKING_STATUS', entities };
  }

  if (
    cleanText.includes('how to book') ||
    cleanText.includes('how it works') ||
    cleanText.includes('explain how to') ||
    cleanText.includes('help me book')
  ) {
    return { intent: 'GET_BOOKING_HELP', entities };
  }

  if (
    cleanText.includes('create a service request') ||
    cleanText.includes('help me create') ||
    cleanText.includes('is not draining') ||
    cleanText.includes('is leaking') ||
    cleanText.includes('not working') ||
    cleanText.includes('broken') ||
    cleanText.includes('repair my')
  ) {
    entities.description = text;
    return { intent: 'CREATE_SERVICE_REQUEST', entities };
  }

  if (
    cleanText.includes('find') ||
    cleanText.includes('search') ||
    cleanText.includes('need an') ||
    cleanText.includes('need a') ||
    cleanText.includes('near me') ||
    cleanText.includes('looking for')
  ) {
    return { intent: 'FIND_SERVICE', entities };
  }

  // Default fallback if category present
  if (entities.category) {
    return { intent: 'FIND_SERVICE', entities };
  }

  return { intent: 'UNKNOWN', entities };
}

module.exports = { parseIntent, CATEGORY_MAP, CITY_LIST };
