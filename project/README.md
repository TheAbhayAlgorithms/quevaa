# Quevaa — QR-Based Digital OPD Queue Management

> **Skip the chaos. Track your OPD queue in real-time.**

A modern, production-ready web platform for hospital and clinic Outpatient Department (OPD) queue management. Patients scan a QR code outside a doctor's room, verify their mobile number with a secure 6-digit OTP, receive an atomic token, and track their live queue position directly from their phone's browser without downloading any application.

Hospital staff and doctors have dedicated real-time control panels to call patients, skip absentees, manage priority cases, and pause or reset queues.

🌐 **Live Production Deployment**: [https://quevaa.vercel.app](https://quevaa.vercel.app)

---

## 🔗 Live URLs & Quick Links

| Portal / Page | Live Production Link | Description |
| :--- | :--- | :--- |
| **Landing Page** | [quevaa.vercel.app](https://quevaa.vercel.app) | Public homepage & hospital overview |
| **Staff Portal Login** | [quevaa.vercel.app/staff/login](https://quevaa.vercel.app/staff/login) | Hospital staff & doctor authentication |
| **Staff Dashboard** | [quevaa.vercel.app/staff/dashboard](https://quevaa.vercel.app/staff/dashboard) | Full hospital queue management & QR printouts |
| **Doctor Room View** | [quevaa.vercel.app/staff/doctor](https://quevaa.vercel.app/staff/doctor) | Minimal, distraction-free doctor consultation view |
| **Sample QR Check-In** | [quevaa.vercel.app/check-in/d1000001-0000-0000-0000-000000000001](https://quevaa.vercel.app/check-in/d1000001-0000-0000-0000-000000000001) | Dr. Priya Sharma (General Medicine) |
| **Sample QR Check-In** | [quevaa.vercel.app/check-in/d1000001-0000-0000-0000-000000000002](https://quevaa.vercel.app/check-in/d1000001-0000-0000-0000-000000000002) | Dr. Rajesh Patel (Orthopedics) |
| **Sample QR Check-In** | [quevaa.vercel.app/check-in/d1000001-0000-0000-0000-000000000003](https://quevaa.vercel.app/check-in/d1000001-0000-0000-0000-000000000003) | Dr. Ananya Gupta (Pediatrics) |
| **Live Queue Tracker** | [quevaa.vercel.app/track?id={trackingToken}](https://quevaa.vercel.app/track) | Real-time live status for patients |

---

## 🔑 Default Staff / Admin Credentials

To log in to the staff portals (`/staff/login`):

- **Username / Email**: `admin` _(or `admin@quevaa.com`)_
- **Password**: `Quevaa@2026`

> **Note on Changing or Recovering Credentials:**
> Staff authentication credentials are configurable in your environment settings:
> - **In production (Vercel):** Set the `STAFF_USERNAME`, `STAFF_EMAIL`, and `STAFF_PASSWORD` environment variables in your Vercel Project Settings.
> - **In local development:** Set them in `project/.env.local`.
> - **Code fallback:** Defined in [`project/app/api/auth/staff-login/route.ts`](project/app/api/auth/staff-login/route.ts).

---

## 🚀 Key Features

- **Mobile QR Check-In**: Patients scan room QR posters to register — zero app installation required.
- **6-Digit Mobile OTP Authentication**: Secure mobile number verification ensures legitimate patients and prevents duplicate/fake entries.
- **Real-Time Queue Tracking**: Live WebSocket updates via Supabase Realtime with a 3-second resilient polling fallback.
- **Dynamic Wait Estimation**: Calculates remaining wait time dynamically based on the doctor's average consultation duration and patients ahead.
- **Two Dedicated Staff Interfaces**:
  - **Receptionist / Admin Dashboard** (`/staff/dashboard`): Complete overview of all hospital doctors, live waiting counters, QR printouts, and doctor switching.
  - **Doctor Consultation Screen** (`/staff/doctor`): Streamlined room view with oversized "Next Patient" trigger, recall controls, and pause/resume buttons.
- **Queue Controls**: Next patient, skip absentee, recall patient, priority flag (⭐ for elderly/emergency), pause queue, and end-of-day queue reset.
- **Atomic Token Counter**: PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) eliminate token collisions during high-traffic registration spikes.
- **Automated Alerts**: Automated SMS & WhatsApp messages for Registration, Approaching (2 tokens away), and Called status.
- **Zero-Config Fallback Store**: Includes a built-in in-memory fallback store (`project/lib/mock-store.ts`) that runs seamlessly even without an external database connection.

---

## 🛠 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16** (App Router), **React 19** | TypeScript, React Server & Client Components |
| **Styling** | **Tailwind CSS v4** + Custom Design Tokens | Modern glassmorphic theme, responsive mobile-first UI |
| **Database** | **Supabase (PostgreSQL 15+)** | Relational schema with Row Level Security (RLS) policies |
| **Realtime** | **Supabase Realtime** | WebSocket pub/sub on `queue_sessions` and `queue_entries` |
| **Validation** | **Zod v4** | Strict validation with Indian phone normalization (`+91`) |
| **Security** | **Crypto OTP + nanoid** | 6-digit OTP verification + unguessable tracking tokens |
| **QR Generation** | **qrcode** | Printable vector and canvas QR code generator |
| **Notifications** | **Twilio & Meta WhatsApp Cloud API** | Real-time SMS and WhatsApp dispatch (supports mock mode) |
| **Deployment** | **Vercel** | Edge network deployment at [quevaa.vercel.app](https://quevaa.vercel.app) |

---

## 📁 Project Structure

```
project/
├── app/
│   ├── page.tsx                    # Public landing page
│   ├── layout.tsx                  # Root layout & font configuration
│   ├── globals.css                 # Hospital theme, CSS variables & utilities
│   ├── check-in/[doctorId]/        # QR check-in & OTP verification page
│   ├── track/                      # Patient live tracking page (?id={token})
│   ├── staff/
│   │   ├── login/                  # Staff authentication screen
│   │   ├── dashboard/              # Comprehensive hospital staff dashboard
│   │   └── doctor/                 # Minimal doctor consultation room view
│   └── api/
│       ├── auth/
│       │   ├── otp/send/           # Generate & dispatch 6-digit OTP
│       │   ├── otp/verify/         # Standalone OTP verification
│       │   └── staff-login/        # Staff credentials verification
│       ├── queue/
│       │   ├── join/               # Validate OTP & generate atomic token
│       │   ├── status/             # Patient queue position & wait time
│       │   ├── next/               # Advance queue to next patient
│       │   ├── skip/               # Skip absent patient
│       │   ├── recall/             # Recall previous/skipped patient
│       │   ├── priority/           # Toggle priority (⭐) status
│       │   ├── pause/              # Pause doctor queue
│       │   ├── resume/             # Resume doctor queue
│       │   ├── reset/              # Reset daily queue tokens
│       │   └── dashboard/          # Aggregated queue metrics for staff
│       ├── doctors/                # List active hospital doctors & session status
│       ├── notifications/send/     # Notification dispatch engine
│       └── webhooks/               # Twilio & WhatsApp delivery receipt webhooks
├── components/
│   ├── CheckInForm.tsx             # 2-step OTP verification & check-in component
│   ├── QueueStatus.tsx             # Real-time patient progress tracker widget
│   ├── StaffControls.tsx           # Hospital staff queue management controls
│   └── QRCodeDisplay.tsx           # Printable QR code component for hospital desks
├── lib/
│   ├── queue.ts                    # Central queue business logic orchestrator
│   ├── mock-store.ts               # In-memory store fallback for demo & offline mode
│   ├── otp.ts                      # Cryptographic OTP generator with rate limiting
│   ├── notifications.ts            # WhatsApp & SMS notification builder
│   ├── validation.ts               # Zod validation schemas & phone normalizer (+91)
│   ├── supabase-server.ts          # Server-side Supabase client (service role)
│   └── supabase-browser.ts         # Client-side Supabase client (browser realtime)
├── types/
│   └── database.ts                 # TypeScript interfaces for database entities
├── database/
│   ├── schema.sql                  # PostgreSQL tables, RLS policies, and stored procedures
│   └── seed.sql                    # Initial seed data (sample hospital and doctors)
└── .env.local.example              # Environment variables template
```

---

## 📋 Local Setup & Installation

### Prerequisites
- **Node.js**: 18.x or later
- **npm** or **yarn** / **pnpm**
- A [Supabase](https://supabase.com) project *(optional: app falls back to in-memory store if omitted)*

### 1. Clone the Repository
```bash
git clone https://github.com/TheAbhayAlgorithms/svasth.git
cd svasth/project
npm install
```

### 2. Configure Environment Variables
Copy the template file to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in your configuration:
```env
# Application Base URL (Use https://quevaa.vercel.app for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Credentials (Optional for local testing, required for database persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Staff Authentication
STAFF_USERNAME=admin
STAFF_EMAIL=admin@quevaa.com
STAFF_PASSWORD=Quevaa@2026

# Notifications Mode ('mock' prints to server console, 'live' sends real SMS/WhatsApp)
NOTIFICATION_MODE=mock
```

### 3. Database Initialization (Supabase)
In your Supabase SQL Editor:
1. Run [`database/schema.sql`](database/schema.sql) — Creates tables, RLS policies, and token generator functions.
2. Run [`database/seed.sql`](database/seed.sql) — Populates sample hospital and doctors.
3. In **Database > Replication**, enable realtime replication for:
   - `queue_sessions`
   - `queue_entries`

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Vercel Deployment Configuration

This project is deployed on **Vercel** at [quevaa.vercel.app](https://quevaa.vercel.app).

To configure or deploy your own instance on Vercel:
1. Connect your GitHub repository to Vercel.
2. Set **Root Directory** to `project`.
3. Add the following **Environment Variables** in Vercel Project Settings:
   - `NEXT_PUBLIC_APP_URL`: `https://quevaa.vercel.app` (or your custom domain)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `STAFF_USERNAME`: `admin`
   - `STAFF_EMAIL`: `admin@quevaa.com`
   - `STAFF_PASSWORD`: `Quevaa@2026`
   - `NOTIFICATION_MODE`: `mock` *(or provide Twilio / WhatsApp API keys for live SMS)*
4. Click **Deploy**.

---

## 📝 API Endpoints Reference

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/otp/send` | Public | Generate and send a 6-digit OTP to patient's mobile |
| `POST` | `/api/auth/otp/verify` | Public | Verify 6-digit OTP validity |
| `POST` | `/api/queue/join` | Public | Validate OTP, register patient, and assign atomic token |
| `GET` | `/api/queue/status?id={token}` | Public | Retrieve patient live queue position and wait estimation |
| `POST` | `/api/auth/staff-login` | Staff | Authenticate hospital staff and doctors |
| `GET` | `/api/doctors` | Public / Staff | List all active doctors with today's queue status |
| `POST` | `/api/queue/dashboard` | Staff | Fetch real-time dashboard statistics and patient list |
| `POST` | `/api/queue/next` | Staff | Advance queue to the next waiting patient |
| `POST` | `/api/queue/skip` | Staff | Mark current patient as skipped (absent) |
| `POST` | `/api/queue/recall` | Staff | Re-summon a skipped or previous patient |
| `POST` | `/api/queue/priority` | Staff | Toggle priority (⭐) status for a patient |
| `POST` | `/api/queue/pause` | Staff | Pause doctor queue session |
| `POST` | `/api/queue/resume` | Staff | Resume paused queue session |
| `POST` | `/api/queue/reset` | Staff | Reset doctor session tokens for the day |
| `POST` | `/api/notifications/send` | Internal | Dispatch SMS / WhatsApp alerts |

---

## 🔒 Security & Privacy Practices

- **Zero Passwords for Patients**: Frictionless QR check-in without storing patient passwords.
- **OTP Brute-Force & Expiry Protection**: 10-minute expiry window, 3-attempt lock, and a 30-second resend cooldown timer.
- **Unguessable Tracking URLs**: Patient tracking URLs use cryptographically random NanoIDs (`/track?id=...`), preventing URL manipulation or enumeration attacks.
- **Row Level Security (RLS)**: Enforced across PostgreSQL tables. Patients can only query entries matching their specific tracking token.
- **Service Role Key Isolation**: Backend operations utilize the Supabase `service_role` key strictly in server-side API routes, never exposed to the client.
- **HIPAA / Privacy Conscious**: Notifications never contain diagnoses, prescriptions, or sensitive medical health data.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
