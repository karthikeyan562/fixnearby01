const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const ServiceRequest = require('../src/models/ServiceRequest');
const Quotation = require('../src/models/Quotation');
const Booking = require('../src/models/Booking');

describe('FixNearby API & Integration Tests', () => {
  let customerToken;
  let providerToken;
  let adminToken;
  let customerId;
  let providerId;
  let createdRequestId;
  let createdQuotationId;
  let createdBookingId;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Quotation.deleteMany({});
    await Booking.deleteMany({});
  }, 15000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Authentication Endpoints', () => {
    test('POST /api/auth/register - Should register a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'testcustomer@example.com',
          password: 'password123',
          role: 'customer',
          location: { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002' },
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('customer');

      customerToken = res.body.token;
      customerId = res.body.user._id;
    });

    test('POST /api/auth/register - Should register a new service provider', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Electrician Provider',
          email: 'testprovider@example.com',
          password: 'password123',
          role: 'provider',
          businessName: 'Test Spark Electric Works',
          serviceCategories: ['Electrician'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('provider');
      expect(res.body.providerProfile).toBeDefined();

      providerToken = res.body.token;
      providerId = res.body.user._id;
    });

    test('POST /api/auth/register - Should prevent duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'testcustomer@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already exists');
    });

    test('POST /api/auth/login - Should login customer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testcustomer@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test('GET /api/auth/me - Should get logged in user details', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('testcustomer@example.com');
    });
  });

  describe('2. Service Requests & Quotations Workflow', () => {
    test('POST /api/requests - Customer should create a service request', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          category: 'Electrician',
          title: 'Circuit Breaker Repair',
          description: 'Main fuse box is tripping continuously when heater is turned on.',
          serviceLocation: { city: 'Coimbatore', locality: 'RS Puram', postalCode: '641002', address: '123 Main St' },
          preferredDate: new Date(Date.now() + 86400000).toISOString(),
          urgency: 'high',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.status).toBe('open');

      createdRequestId = res.body.data._id;
    });

    test('POST /api/requests/:id/quotations - Provider should submit quotation', async () => {
      const res = await request(app)
        .post(`/api/requests/${createdRequestId}/quotations`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          proposedPrice: 450,
          workDescription: 'Replace faulty 32A MCB switch and insulate terminal contacts.',
          estimatedDuration: '1 hour',
          proposedAppointment: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.proposedPrice).toBe(450);
      createdQuotationId = res.body.data._id;
    });

    test('POST /api/requests/:id/quotations - Provider should not submit duplicate quotation', async () => {
      const res = await request(app)
        .post(`/api/requests/${createdRequestId}/quotations`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          proposedPrice: 500,
          workDescription: 'Duplicate quote attempt',
          proposedAppointment: new Date().toISOString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('already submitted');
    });

    test('POST /api/quotations/:id/accept - Customer accepts quotation to form booking', async () => {
      const res = await request(app)
        .post(`/api/quotations/${createdQuotationId}/accept`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.booking).toBeDefined();
      expect(res.body.booking.agreedPrice).toBe(450);

      createdBookingId = res.body.booking._id;
    });

    test('POST /api/quotations/:id/accept - Should prevent accepting quotation twice', async () => {
      const res = await request(app)
        .post(`/api/quotations/${createdQuotationId}/accept`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('already been booked');
    });
  });

  describe('3. Booking Status & Review Flow', () => {
    test('PATCH /api/bookings/:id/status - Provider updates status to in_progress then completed', async () => {
      let res = await request(app)
        .patch(`/api/bookings/${createdBookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'in_progress' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('in_progress');

      res = await request(app)
        .patch(`/api/bookings/${createdBookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });

    test('POST /api/bookings/:id/review - Customer submits review for completed booking', async () => {
      const res = await request(app)
        .post(`/api/bookings/${createdBookingId}/review`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          reviewText: 'Excellent work! Quick diagnosis and clean job.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });
  });

  describe('4. FixNearby Voice Assistant Endpoint', () => {
    test('POST /api/assistant/message - Should recognize service search intent', async () => {
      const res = await request(app)
        .post('/api/assistant/message')
        .send({ message: 'Find an electrician in Coimbatore' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('FIND_SERVICE');
      expect(res.body.entities.category).toBe('Electrician');
    });

    test('POST /api/assistant/message - Should handle guided request creation', async () => {
      const res = await request(app)
        .post('/api/assistant/message')
        .send({
          message: 'My washing machine is leaking water',
          draftRequest: {},
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.intent).toBe('CREATE_SERVICE_REQUEST');
      expect(res.body.confirmationCard).toBeDefined();
      expect(res.body.confirmationCard.category).toBe('Appliance Repair');
    });
  });
});
