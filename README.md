# CarBook

CarBook is a full-stack car-rental platform built with the MERN stack. It demonstrates authentication, authorization, date-based inventory, secure payment verification, refund handling, image uploads, reviews, admin workflows, transactional email, validation, rate limiting and production-oriented API security.

## Architecture

```text
CarBook_Updated/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── validation/
│   └── server.js
├── .env.example
└── package.json
```

The backend follows `route -> validation/middleware -> controller -> model/service`. Business rules that must be shared or isolated, such as reservation locking and server-side price calculation, live in `services/`.

## Stack

Frontend: React, React Router, Tailwind CSS, Axios, Framer Motion, Lucide React

Backend: Node.js, Express, MongoDB, Mongoose, Zod

Authentication: HttpOnly JWT session cookie, bcrypt, Google OAuth 2.0

Payments: Razorpay order creation, signature verification, payment lookup/capture and refunds

Storage: Cloudinary

Email: Nodemailer

Security: Helmet, strict CORS allowlist, mutation-origin checks, rate limiting, bounded request bodies, image MIME/size limits and strict request schemas

## Core flows

### Authentication

Email/password registration hashes passwords with bcrypt. Login creates a signed JWT session stored in an HttpOnly cookie. The token includes a server-checked session version so a password change immediately invalidates older sessions. The client never reads or stores the JWT. Google OAuth uses a cryptographically random state cookie, then ends with the same HttpOnly session cookie without placing a token in the URL.

Admin access is stored as a database role. It is not inferred from an email address. Promote an existing account locally with:

```bash
npm --prefix server run make-admin -- admin@example.com
```

### Booking and availability

Cars have an operational status: `active`, `maintenance` or `inactive`. Reservation availability is not represented by a global boolean.

For every requested interval, the backend checks overlapping confirmed bookings and unexpired pending holds. A short database-backed per-car lock serializes reservation-sensitive transitions so concurrent requests cannot both pass the overlap check.

Pending payment bookings hold the requested interval for 12 minutes. Payment confirmation rechecks the dates under the lock before the booking becomes confirmed.

### Pricing

All final prices are calculated on the server from the stored `Car` document. For package bookings the client sends only `packageId`; package price and duration are looked up from MongoDB. The client cannot submit a trusted amount.

Currency is persisted as integer paise in bookings to avoid floating-point payment errors.

### Razorpay verification

A payment can confirm a booking only when all of these are true:

1. The authenticated user owns the booking.
2. The submitted order ID equals the order ID stored on that booking.
3. The HMAC signature is valid.
4. Razorpay reports that payment for the same order.
5. Razorpay's amount equals the server-calculated booking amount.
6. Currency is INR.
7. The payment is captured.
8. The booking interval is still available.

If a captured payment arrives after the hold expires or after the dates become unavailable, the backend initiates a refund and cancels the booking rather than leaving the payment detached from a reservation.

### Cancellation and refunds

A paid Razorpay booking calls the Razorpay refund API. The booking records the refund ID and either `refund_pending` or `refunded`. Booking records are retained rather than hard-deleted, preserving the payment and reservation audit trail.

### Reviews

A user can review a car only through a completed, previously unreviewed booking for that car. Each completed trip can produce at most one review.

## Local setup

Requirements: Node.js 20+, npm and MongoDB.

```bash
cp .env.example server/.env
cp client/.env.example client/.env
npm run install:all
npm run dev:server
```

In another terminal:

```bash
npm run dev:client
```

Client: `http://localhost:5173`

API: `http://localhost:5000/api`

Health endpoint: `GET /api/health`

## Environment variables

Server variables are documented in `.env.example`. In production, configure Razorpay, Cloudinary, email and Google OAuth only for the integrations you deploy. `JWT_SECRET` must contain at least 32 unpredictable characters.

`FRONTEND_URL` is an allowlist and can contain comma-separated frontend origins. Cookie-based cross-origin production deployments require HTTPS.

## Main API endpoints

| Method | Endpoint                       | Access | Purpose                        |
| ------ | ------------------------------ | ------ | ------------------------------ |
| POST   | `/api/auth/register`           | Public | Create account and session     |
| POST   | `/api/auth/login`              | Public | Create session                 |
| POST   | `/api/auth/logout`             | User   | Clear session                  |
| GET    | `/api/auth/me`                 | User   | Current account                |
| PUT    | `/api/auth/profile`            | User   | Update profile                 |
| PUT    | `/api/auth/password`           | User   | Change password                |
| GET    | `/api/cars`                    | Public | Search/filter active cars      |
| GET    | `/api/cars/admin/all`          | Admin  | Manage all fleet statuses      |
| GET    | `/api/cars/:id`                | Public | Car details                    |
| POST   | `/api/cars/:id/review`         | User   | Review a completed trip        |
| POST   | `/api/bookings`                | User   | Create payment hold/order      |
| POST   | `/api/bookings/verify-payment` | User   | Verify and confirm payment     |
| GET    | `/api/bookings/my-bookings`    | User   | Booking history                |
| PUT    | `/api/bookings/:id/cancel`     | User   | Cancel/refund eligible booking |
| GET    | `/api/bookings/admin/stats`    | Admin  | Dashboard statistics           |
| GET    | `/api/bookings/admin/all`      | Admin  | Manage bookings                |
| PUT    | `/api/bookings/:id/complete`   | Admin  | Complete a trip                |
| POST   | `/api/cars`                    | Admin  | Add car                        |
| PUT    | `/api/cars/:id`                | Admin  | Update car                     |
| DELETE | `/api/cars/:id`                | Admin  | Delete or archive car          |

## Tests and checks

```bash
npm test
npm run lint
npm run build
```

The backend unit tests cover money conversion, timing-safe comparisons, regex escaping, strict booking input, password policy and server-side pricing/package duration behavior. GitHub Actions installs both applications, lints them, runs the server tests and builds the client on pushes and pull requests.