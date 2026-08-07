# Waste Pickup Scheduler

A capstone-ready full-stack application for managing waste collection scheduling, real-time notifications, and dashboard insights.

## Project Overview

This repository contains a monorepo for the Waste Pickup Scheduler application:

- `backend/` - Express.js API with MongoDB authentication and route handling
- `frontend/` - React + Vite single-page app styled with Tailwind CSS

## Features

- Responsive landing page with interactive sections
- Dark mode support
- Mobile-friendly navigation
- Notification dropdown for logged-in users
- Dashboard portal views per user role
- Footer with brand logo and social icons

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, lucide-react
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT-based auth flow

## Getting Started

### Prerequisites

- Node.js (Recommended version 18+)
- npm
- MongoDB running locally or via a cloud provider

### Setup

From the repository root:

```bash
npm run setup
```

This installs dependencies for both backend and frontend.

### Run Development Servers

Start the backend API:

```bash
npm run dev:backend
```

Start the frontend app:

```bash
npm run dev:frontend
```

The frontend should launch on a local Vite URL such as `http://localhost:3000` (or the next available port).

## Production Build

Build the frontend for production:

```bash
npm run build
```

Then start the backend API:

```bash
npm run start
```

## Project Structure

```
backend/
  src/
    server.js
    config/
    controllers/
    middleware/
    models/
    routes/
  package.json

frontend/
  src/
    components/
    context/
    pages/
    services/
  public/
  package.json

package.json
README.md
```

## Notes

- The app currently uses a logo at `/logo.png` for branding
- Footer includes social icons for Facebook, X, Instagram, and TikTok
- Dark header contrast is tuned for readability

## License

MIT
