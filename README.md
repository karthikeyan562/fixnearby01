# FixNearby — Local Service Booking Platform

**FixNearby** is an upgraded full-stack, responsive, and user-friendly web application designed to connect local customers with verified service professionals such as electricians, plumbers, AC technicians, appliance repair experts, carpenters, and painters.

It features an end-to-end booking workflow, quotation comparison, provider verification management, administrative moderation, **FixNearby Voice Helper**, **Interactive 3D Visual Design**, **Customer Satisfaction Videos**, and **Direct Phone Calling**.

---

## 🚀 Key Features & Upgrades

### 🎨 1. Premium 3D Visual Design & Architecture
- **Interactive 3D Scene**: Three.js hero visualization featuring interactive service elements with fallback rendering.
- **3D Category Cards**: Depth hover effects, smooth perspective transforms, and vibrant lighting for Electricians, Plumbers, AC Technicians, Carpenters, Painters, and Appliance Repair.
- **Intro Experience & Ambient Sound**: Lightweight Web Audio synthesizer with user consent, session memory (`sessionStorage`), and persistent Navbar sound toggle (never forced upon repeat visits).

### 📹 2. Customer Satisfaction Videos & Testimonials
- **Real Video Playback**: HTML5 video playback modal with Play/Pause, scrubber seek bar, volume/mute controls, and elapsed time display.
- **Video Review Submissions**: Customers can attach short video clips (up to 50MB) or video URLs directly when leaving reviews on completed bookings.
- **Privacy Protection**: Server-enforced customer privacy sanitization on public endpoints (`GET /api/reviews/testimonials`), displaying customer initials, city, and verified reviews without leaking private phone numbers or email addresses.

### 📞 3. Direct Provider Calling (`tel:`)
- **One-Tap Dialing**: Dedicated `tel:` phone links for instant contact from smartphones and tablets.
- **Desktop Number Copy**: One-click clipboard copy utility for desktop users.
- **Privacy-First Access**: Phone numbers are securely restricted to authenticated customers with confirmed bookings or providers who explicitly set a public business line.

### ⏱️ 4. Enhanced Booking Lifecycle Tracker
- **Status Progression**: Full multi-step timeline (*Confirmed* ➔ *On the Way* ➔ *In Progress* ➔ *Completed*).
- **Status History Audit**: Timestamped history logs tracking every transition made by technicians.

### 👤 5. Customer Capabilities
- Browse and search verified service professionals by category, locality, minimum rating, experience, and pricing.
- Post custom service requests with problem titles, descriptions, address details, preferred dates, urgency levels, and optional photo attachments.
- Receive upfront price quotations from nearby technicians.
- Compare estimates side-by-side and accept the preferred quotation.
- Track real-time booking status and contact assigned technicians directly.
- Leave ratings, reviews, and video feedback for completed jobs.

### 🛠️ 6. Service Provider Capabilities
- Create a professional business profile, select service categories, and set service areas.
- Showcase completed project portfolios with photo galleries, project titles, and descriptions.
- Upload identity credentials & trade licenses for **Admin Verification Badge**.
- Receive real-time service requests matching trade categories in the provider's region.
- Submit custom quotations with proposed price estimates, work descriptions, and estimated duration.
- Update execution status in real-time (*On the Way*, *In Progress*, *Completed*).
- Monitor gross earnings and customer feedback.

### 🛡️ 7. Administrator Portal
- Protected dashboard restricted to authorized administrators.
- Real-time platform analytics: total users, active requests, bookings, revenue, pending verifications, and reports.
- Moderation queue to review uploaded documents and **Approve or Reject Provider Verifications**.
- User account management with **Account Suspension / Activation** controls.
- Review and resolve user complaints and listing reports.

### 🎙️ 8. FixNearby Voice Helper (Voice Assistant)
- Floating mic button available across customer pages.
- Conversational panel with Speech Recognition (`webkitSpeechRecognition`) & Text-to-Speech (`SpeechSynthesis`).
- Voice controls: Mute/Unmute, Audio Replay, Stop Speaking, and Text Input Fallback.
- Intent parser processing backend (`POST /api/assistant/message`).
- Step-by-step guided service request creation with review card and explicit user confirmation.

---

## 💻 Tech Stack

- **Frontend**: React.js 18 (Vite), Three.js, Lucide Icons, Vanilla CSS3 (Design Tokens, 3D CSS Perspectives, Glassmorphism).
- **Backend**: Node.js, Express.js RESTful API, JWT Authentication, bcryptjs password hashing, Multer file & video upload storage.
- **Database**: MongoDB with Mongoose schemas (includes automatic `MongoMemoryServer` fallback for instant out-of-the-box local execution!).
- **Testing**: Jest and Supertest automated API test suite.

---

## ⚡ Quick One-Click Demo Credentials

The backend automatically seeds pre-configured demo accounts for instant testing:

| User Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `ramesh@example.com` | `password123` |
| **Customer** | `priya@example.com` | `password123` |
| **Provider (Electrician - Verified)** | `suresh.elec@example.com` | `password123` |
| **Provider (Plumber - Verified)** | `murugan.plumb@example.com` | `password123` |
| **Provider (Carpenter - Pending)** | `velu.carpenter@example.com` | `password123` |
| **Administrator** | `admin@fixnearby.com` | `admin123` |

*(Note: The login page includes quick autofill buttons for 1-click testing!)*

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Server Setup (Backend)

```bash
cd server
npm install
npm start
```
The server will start at `http://localhost:5000`. If a local MongoDB daemon is running, it connects to `mongodb://localhost:27017/fixnearby`. Otherwise, it automatically launches an in-memory MongoDB instance and seeds initial test data out of the box!

To re-seed fresh test data at any time:
```bash
node src/utils/seed.js
```

### 2. Client Setup (Frontend)

In a new terminal window:

```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

To create a production build:
```bash
npm run build
```

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` - User registration (Customer or Provider)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current authenticated user details

### Providers
- `GET /api/providers` - Search/filter provider listings (category, rating, experience, locality, availability)
- `GET /api/providers/:id` - Detailed provider profile & reviews
- `PUT /api/providers/profile` - Update business bio, contact phone, and pricing
- `POST /api/providers/portfolio` - Upload project image and description to portfolio
- `PUT /api/providers/availability` - Toggle working availability
- `POST /api/providers/verification` - Upload verification documents

### Service Requests & Quotations
- `POST /api/requests` - Submit new service request
- `GET /api/requests` - Fetch requests matching role
- `POST /api/requests/:id/quotations` - Provider submits quotation
- `POST /api/quotations/:id/accept` - Customer accepts quote & confirms booking

### Bookings & Reviews
- `GET /api/bookings` - Fetch user bookings
- `GET /api/bookings/:id` - Detailed booking progress & technician contact info
- `PATCH /api/bookings/:id/status` - Update job status (`confirmed`, `on_the_way`, `in_progress`, `completed`)
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/review` - Leave review & video feedback for completed booking
- `GET /api/reviews/testimonials` - Public customer satisfaction video testimonials
- `GET /api/reviews/providers/:id` - Provider-specific reviews

### Media Upload
- `POST /api/upload` - Secure file & video upload endpoint (images, PDFs, MP4/WebM videos up to 50MB)

### Voice Assistant
- `POST /api/assistant/message` - Intent classification & assistant service

### Admin Portal
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/providers/pending` - Pending verifications queue
- `PATCH /api/admin/providers/:id/verification` - Approve/Reject verification
- `PATCH /api/admin/users/:id/status` - Suspend/Activate account
- `GET /api/admin/reports` - Complaint reports queue
- `PATCH /api/admin/reports/:id` - Resolve or dismiss reports
