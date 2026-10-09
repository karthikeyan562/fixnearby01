const API_BASE = window.location.port === '5000'
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('fixnearby_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
    }
    throw new Error('Received unexpected response format from server.');
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || 'API Request Failed');
  }
  return data;
};


export const api = {
  // Auth
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  // Providers
  getProviders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/providers?${query}`).then(handleResponse);
  },

  getProviderById: (id) => fetch(`${API_BASE}/providers/${id}`).then(handleResponse),

  updateProviderProfile: (body) =>
    fetch(`${API_BASE}/providers/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  updateAvailability: (body) =>
    fetch(`${API_BASE}/providers/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  submitVerification: (formData) =>
    fetch(`${API_BASE}/providers/verification`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    }).then(handleResponse),

  getProviderRequests: () =>
    fetch(`${API_BASE}/providers/me/requests`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  // Service Requests
  createRequest: (body) =>
    fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/requests?${query}`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse);
  },

  getRequestById: (id) =>
    fetch(`${API_BASE}/requests/${id}`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  updateRequestStatus: (id, status) =>
    fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  // Quotations
  createQuotation: (requestId, body) =>
    fetch(`${API_BASE}/requests/${requestId}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getQuotationsForRequest: (requestId) =>
    fetch(`${API_BASE}/requests/${requestId}/quotations`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  getProviderQuotations: () =>
    fetch(`${API_BASE}/quotations/me`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  acceptQuotation: (quotationId) =>
    fetch(`${API_BASE}/quotations/${quotationId}/accept`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  // Bookings
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/bookings?${query}`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse);
  },

  getBookingById: (id) =>
    fetch(`${API_BASE}/bookings/${id}`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  updateBookingStatus: (id, status) =>
    fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  cancelBooking: (id) =>
    fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  // Reviews
  createReview: (bookingId, body) =>
    fetch(`${API_BASE}/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getProviderReviews: (providerId) =>
    fetch(`${API_BASE}/reviews/providers/${providerId}`).then(handleResponse),

  getTestimonials: () =>
    fetch(`${API_BASE}/reviews/testimonials`).then(handleResponse),


  // Notifications
  getNotifications: () =>
    fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  // Admin
  getAdminStats: () =>
    fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  getPendingProviders: () =>
    fetch(`${API_BASE}/admin/providers/pending`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  verifyProvider: (id, status) =>
    fetch(`${API_BASE}/admin/providers/${id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getAdminUsers: () =>
    fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  updateUserStatus: (id, accountStatus) =>
    fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ accountStatus }),
    }).then(handleResponse),

  getAdminReports: () =>
    fetch(`${API_BASE}/admin/reports`, {
      headers: { ...getAuthHeaders() },
    }).then(handleResponse),

  updateReportStatus: (id, status) =>
    fetch(`${API_BASE}/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  createReport: (body) =>
    fetch(`${API_BASE}/admin/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  // Voice Assistant Endpoint
  sendAssistantMessage: (body) =>
    fetch(`${API_BASE}/assistant/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  // Upload
  uploadFile: (formData) =>
    fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    }).then(handleResponse),

  // Provider Portfolio
  addPortfolioItem: (formData) =>
    fetch(`${API_BASE}/providers/portfolio`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    }).then(handleResponse),
};
