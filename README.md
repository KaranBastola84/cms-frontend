# CMS Frontend

A modern React + Vite frontend for a role-based Coffee School Management System (CMS) with:

- Public landing, inquiry, product browsing, cart, checkout, and order flows
- Secure authentication and role-based dashboards
- Academic operations (courses, batches, attendance, admissions, certificates)
- Financial operations (outstanding payments, payment plans, fees, reports)
- Stripe-enabled payment integrations

The app is designed to work with a backend API that returns structured response wrappers and JWT-based authentication tokens.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Authentication and API Behavior](#authentication-and-api-behavior)
- [Deployment](#deployment)
- [Pre-deploy Checklist](#pre-deploy-checklist)
- [Troubleshooting](#troubleshooting)

## Overview

This frontend supports multiple user personas in one application:

- Admin
- Staff
- Trainer
- Student
- EnrolledStudent

It includes both public and protected areas:

- Public pages for catalog, checkout, inquiry, and certificate verification
- Protected dashboards and management modules based on authenticated user roles

## Core Features

### Public Experience

- Marketing/landing page
- Inquiry submission
- Product listing and shopping cart
- Checkout and order placement
- Public certificate verification:
  - `/certificate/verify`
  - `/certificate/verify/:certificateNumber`

### Role-based Dashboards and Modules

- Admin dashboard with system-wide operational and financial views
- Staff and trainer operational dashboards
- Student dashboard and certificate visibility
- Management modules for:
  - Users and permissions
  - Students and admissions
  - Courses and batches
  - Attendance
  - Certificates
  - Products and orders
  - Finance and reporting

### Finance and Payments

- Outstanding payments and payment plan workflows
- Fee management and revenue reporting
- Stripe service integrations for payment intents and confirmations
- Support for cash and Stripe revenue tracking in finance reporting flows

### Reliability and UX

- API error normalization for consistent user-facing messages
- JWT token refresh handling with queued request retry
- Role dashboard polling for near-real-time updates
- Toast notifications for success/error feedback

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Axios
- Tailwind CSS 4
- Lucide React icons
- React Hot Toast
- Stripe React SDK (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- ESLint 9 (flat config)

## Project Structure

```text
src/
  components/
    common/
    pages/
      admin/
      auth/
      staff/
      student/
      trainer/
  config/
    api.js
    appConfig.js
  constants/
    permissions.js
    orderStatus.js
  context/
    AuthContext.jsx
  contexts/
    AuthContext.js
    CartContext.jsx
  hooks/
    useAuth.js
    useCart.jsx
    useRoleDashboard.js
  routes/
    index.jsx
  services/
    *Service.js
  utils/
    ProtectedRoute.jsx
    dashboardHelpers.js
    helpers.js
```

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend API (recommended for full feature validation)

## Environment Variables

Create or update your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5299
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

Production defaults are supported via `.env.production`:

- If `VITE_API_BASE_URL` is empty in production, the app uses same-origin API calls.
- `VITE_STRIPE_PUBLISHABLE_KEY` should be set only to a public Stripe key (`pk_...`).
- Never place Stripe secret keys (`sk_...`) in frontend environment variables.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (`.env`).

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL shown by Vite (typically http://localhost:5173).

## Available Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Create production build in dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

Useful verification commands:

```bash
npm audit --omit=dev
npm run lint && npm run build && npm audit --omit=dev
```

## Authentication and API Behavior

- JWT tokens are stored in `localStorage`:
  - `accessToken`
  - `refreshToken`
  - `userData`
- Axios request interceptor attaches bearer token automatically.
- On `401`, the app attempts token refresh (`/api/Auth/refresh`) and retries queued requests.
- Public endpoints (for example certificate verify) bypass forced auth retry behavior.
- API error responses with arrays (for example `errorMessage`) are normalized for readable toasts.

## Deployment

Build the app:

```bash
npm run build
```

Deploy the `dist/` output to your static hosting platform.

SPA fallback rewrites are already configured for common hosts:

- Vercel: `vercel.json`
- Azure Static Web Apps: `staticwebapp.config.json`
- Netlify: `public/_redirects`

## Pre-deploy Checklist

- `npm run lint` passes
- `npm run build` succeeds
- `npm audit --omit=dev` reviewed
- Production environment variables injected
- Backend API base URL confirmed for production
- Stripe publishable key configured if card payments are enabled

## Troubleshooting

### Backend unreachable or dashboards not loading

- Verify backend server is running.
- Confirm `VITE_API_BASE_URL` points to a reachable API.
- Check browser network tab for failing `/api/*` requests.

### Redirected to login unexpectedly

- Access token may be expired and refresh may have failed.
- Clear local storage and login again.

### Stripe form or payment actions unavailable

- Ensure `VITE_STRIPE_PUBLISHABLE_KEY` is set.
- Confirm the key starts with `pk_` and belongs to the correct Stripe account mode.

---

If you want, I can also generate a short API integration section in this README that maps each major frontend service file to its backend endpoint group.
