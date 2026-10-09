const { parseIntent } = require('./intentParser');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function processAssistantMessage({ message, draftRequest = null, user = null }) {
  const { intent, entities } = parseIntent(message);

  let responsePayload = {
    spokenText: '',
    displayText: '',
    intent,
    entities,
    draftRequest: draftRequest || {},
    confirmationCard: null,
    dataResults: null,
    requiredNextField: null,
  };

  // Helper merge function
  const currentDraft = { ...draftRequest };
  if (entities.category) currentDraft.category = entities.category;
  if (entities.city) currentDraft.city = entities.city;
  if (entities.urgency) currentDraft.urgency = entities.urgency;
  if (entities.preferredDate) currentDraft.preferredDate = entities.preferredDate;
  if (entities.description && !currentDraft.description) currentDraft.description = entities.description;

  switch (intent) {
    case 'FIND_SERVICE': {
      const category = entities.category || currentDraft.category;
      const city = entities.city || currentDraft.city || (user?.location?.city || '');

      const query = {};
      if (category) query.serviceCategories = { $regex: new RegExp(category, 'i') };
      if (city) query['serviceAreas.city'] = { $regex: new RegExp(city, 'i') };

      let providers = await ProviderProfile.find(query)
        .populate('userId', 'name phone location accountStatus')
        .sort({ averageRating: -1 })
        .limit(5);

      providers = providers.filter((p) => p.userId && p.userId.accountStatus !== 'suspended');

      if (providers.length > 0) {
        const catStr = category ? category : 'service';
        const locStr = city ? ` in ${city}` : '';
        responsePayload.spokenText = `Found ${providers.length} verified ${catStr} providers${locStr}. Would you like to view their profiles or submit a request?`;
        responsePayload.displayText = `Found ${providers.length} available ${catStr} top-rated providers${locStr}:`;
        responsePayload.dataResults = providers;
      } else {
        const catStr = category ? category : 'service';
        responsePayload.spokenText = `I couldn't find any active ${catStr} providers matching your area right now. Would you like to create a service request so nearby technicians can send you quotes?`;
        responsePayload.displayText = `No direct provider matches for "${catStr}"${city ? ' in ' + city : ''}. You can post a custom service request to receive quotes!`;
      }
      break;
    }

    case 'CHECK_BOOKING_STATUS': {
      if (!user) {
        responsePayload.spokenText = 'Please log in to view your account bookings.';
        responsePayload.displayText = 'Log in required to view active booking status.';
        break;
      }

      const queryKey = user.role === 'provider' ? 'providerId' : 'customerId';
      const bookings = await Booking.find({ [queryKey]: user._id })
        .populate('requestId', 'title category')
        .populate('providerId', 'name phone')
        .populate('customerId', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5);

      if (bookings.length > 0) {
        const topBooking = bookings[0];
        const statusClean = topBooking.status.replace('_', ' ');
        const reqTitle = topBooking.requestId?.title || topBooking.requestId?.category || 'Service';
        
        responsePayload.spokenText = `You have ${bookings.length} active bookings. Your latest booking for ${reqTitle} is currently ${statusClean}.`;
        responsePayload.displayText = `Found ${bookings.length} active bookings in your account:`;
        responsePayload.dataResults = bookings;
      } else {
        responsePayload.spokenText = 'You currently do not have any active service bookings.';
        responsePayload.displayText = 'No active bookings found in your account history.';
      }
      break;
    }

    case 'CREATE_SERVICE_REQUEST':
    case 'GUIDED_STEP': {
      // Check required fields for request wizard
      if (!currentDraft.category) {
        responsePayload.spokenText = 'What type of service do you need? For example: Electrician, Plumber, or AC Repair.';
        responsePayload.displayText = 'Please specify the service category (e.g., Electrician, Plumber, AC Repair, Appliance Repair).';
        responsePayload.requiredNextField = 'category';
      } else if (!currentDraft.description && !message.toLowerCase().includes(currentDraft.category.toLowerCase())) {
        currentDraft.description = message;
      }

      if (!currentDraft.description || currentDraft.description.length < 5) {
        if (!responsePayload.requiredNextField) {
          responsePayload.spokenText = `Got it, ${currentDraft.category}! Please describe the issue you are experiencing in a few words.`;
          responsePayload.displayText = `Please describe the problem for your ${currentDraft.category} request:`;
          responsePayload.requiredNextField = 'description';
        }
      } else if (!currentDraft.city) {
        const userCity = user?.location?.city || 'Coimbatore';
        currentDraft.city = userCity;
        currentDraft.locality = user?.location?.locality || 'Town Hall';
        currentDraft.postalCode = user?.location?.postalCode || '641001';
      }

      if (!currentDraft.preferredDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        currentDraft.preferredDate = tomorrow.toISOString().split('T')[0];
      }

      responsePayload.draftRequest = currentDraft;

      // If all required fields are present, build confirmation card
      if (currentDraft.category && currentDraft.description && currentDraft.description.length >= 5) {
        responsePayload.confirmationCard = {
          category: currentDraft.category,
          title: currentDraft.title || `${currentDraft.category} Service Request`,
          description: currentDraft.description,
          serviceLocation: {
            city: currentDraft.city || 'Coimbatore',
            locality: currentDraft.locality || 'Main Area',
            postalCode: currentDraft.postalCode || '641001',
            address: currentDraft.address || 'User Address',
          },
          preferredDate: currentDraft.preferredDate,
          urgency: currentDraft.urgency || 'medium',
        };

        responsePayload.spokenText = `I have compiled your ${currentDraft.category} service request. Please review the details on screen and confirm to post it.`;
        responsePayload.displayText = `Ready to create your ${currentDraft.category} request! Please verify the details below and click "Confirm & Submit Request".`;
      }
      break;
    }

    case 'GET_BOOKING_HELP': {
      responsePayload.spokenText = 'FixNearby connects you with local technicians. You submit a problem description, receive price quotations from nearby verified providers, choose your preferred estimate, and track job completion.';
      responsePayload.displayText = 'Here is how FixNearby works:\n1. Submit a service request with description and preferred date.\n2. Receive instant quotes from nearby verified technicians.\n3. Compare estimates & accept the best deal.\n4. Technician arrives and completes your job!';
      break;
    }

    default: {
      responsePayload.spokenText = 'I am FixNearby Voice Helper. I can help you search for local plumbers or electricians, create a service request, or check your booking status. What can I do for you today?';
      responsePayload.displayText = 'I can help you with:\n- Searching nearby service professionals ("Find an electrician near me")\n- Submitting a service request ("My washing machine is leaking")\n- Checking booking status ("Show my active bookings")';
      break;
    }
  }

  return responsePayload;
}

module.exports = { processAssistantMessage };
