# Airbnb Clone — Capstone Project

A full-stack Airbnb-style accommodation booking platform built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Features](#features)

---

## Project Overview

This application allows users to browse accommodation listings, view property details, make reservations, and manage bookings. Hosts and admins can create, edit, and delete listings through a protected admin dashboard.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite, React Router v7, Axios  |
| Backend   | Node.js, Express 5, Mongoose            |
| Database  | MongoDB Atlas                           |
| Auth      | JSON Web Tokens (JWT), bcryptjs         |
| File Upload | Multer (local disk storage)           |
| Testing   | Jest, Supertest                         |

---

## Project Structure

```
capstone-project/
├── public/                  # Static assets
├── src/                     # React frontend
│   ├── api/                 # Axios instance with JWT interceptor
│   ├── components/          # Shared components (Header, Footer, Layout)
│   ├── context/             # AuthContext (login, logout, register)
│   ├── pages/
│   │   ├── Home/            # Landing page
│   │   ├── Location/        # Browse listings with filters
│   │   ├── LocationDetails/ # Single listing + reservation form
│   │   └── Admin/           # Dashboard, ListingForm, ReservationsPage
│   └── main.jsx             # App entry point
├── server/                  # Express backend
│   ├── controllers/         # Route handler logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── tests/               # Jest + Supertest API tests
│   ├── uploads/             # Uploaded listing images
│   ├── app.js               # Express app (no server.listen)
│   └── server.js            # DB connection + server start
├── .env.example             # Frontend env template
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A MongoDB Atlas account and cluster URI

### Environment Variables

**Backend** — create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5174
```

| Variable       | Description                                      |
|----------------|--------------------------------------------------|
| `PORT`         | Port the Express server listens on               |
| `MONGO_URI`    | MongoDB Atlas connection string                  |
| `JWT_SECRET`   | Secret key used to sign JWT tokens               |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`, `24h`)       |
| `CLIENT_URL`   | Frontend origin allowed by CORS                  |

**Frontend** — create `src/.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable       | Description                                      |
|----------------|--------------------------------------------------|
| `VITE_API_URL` | Base URL for all API requests                    |

> All `VITE_` prefixed variables are exposed to the browser. Never store secrets here.

### Running Locally

**1. Install frontend dependencies**
```bash
npm install
```

**2. Install backend dependencies**
```bash
cd server
npm install
```

**3. Start the backend**
```bash
cd server
npm run dev
```
You should see:
```
MongoDB connected
Server running on port 5000
```

**4. Start the frontend** (in a new terminal, from the project root)
```bash
npm run dev
```
The app will be available at `http://localhost:5174`.

**5. (Optional) Seed the database**
```bash
cd server
node seed.js <your-admin-email> <your-admin-password>
```

---

## Available Scripts

### Frontend (project root)

| Script          | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start Vite dev server                |
| `npm run build` | Build for production                 |
| `npm run preview` | Preview the production build       |
| `npm run lint`  | Run ESLint                           |

### Backend (`server/`)

| Script          | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start server with nodemon (hot reload)|
| `npm start`     | Start server with node               |
| `npm test`      | Run Jest API tests                   |

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication

| Method | Endpoint              | Access  | Description            |
|--------|-----------------------|---------|------------------------|
| POST   | `/users/register`     | Public  | Register a new user    |
| POST   | `/users/login`        | Public  | Login and receive JWT  |
| GET    | `/users/me`           | Private | Get current user info  |

### Accommodations

| Method | Endpoint                  | Access  | Description                        |
|--------|---------------------------|---------|------------------------------------|
| GET    | `/accommodations`         | Public  | List all (paginated, filterable)   |
| GET    | `/accommodations/:id`     | Public  | Get a single listing               |
| POST   | `/accommodations`         | Private | Create a new listing               |
| PUT    | `/accommodations/:id`     | Private | Update a listing (owner/admin)     |
| DELETE | `/accommodations/:id`     | Private | Delete a listing (owner/admin)     |

**Pagination query params:**
```
GET /accommodations?page=1&limit=12&location=Cape+Town
```

| Param      | Default | Description                        |
|------------|---------|------------------------------------|
| `page`     | 1       | Page number                        |
| `limit`    | 12      | Results per page (max 50)          |
| `location` | —       | Filter by location (case-insensitive) |

**Paginated response shape:**
```json
{
  "data": [...],
  "pagination": {
    "total": 18,
    "page": 1,
    "limit": 12,
    "pages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Reservations

| Method | Endpoint                  | Access  | Description                        |
|--------|---------------------------|---------|------------------------------------|
| POST   | `/reservations`           | Private | Create a reservation               |
| GET    | `/reservations/user`      | Private | Get current user's reservations    |
| GET    | `/reservations/host`      | Private | Get reservations for host listings |
| DELETE | `/reservations/:id`       | Private | Cancel a reservation               |

---

## Running Tests

Make sure the backend `.env` file is configured with a valid `MONGO_URI`, then run:

```bash
cd server
npm test
```

Tests are located in `server/tests/` and cover:
- **auth.test.js** — user registration, login, and profile endpoint
- **accommodations.test.js** — CRUD operations, pagination, and auth protection

Each test run creates and cleans up its own test data, so running tests is safe against your live database.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Root directory:** `server`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables in the Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL` (set to your frontend URL)
   - `PORT` (Render sets this automatically)

### Frontend — Vercel / Netlify

1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Set the build settings:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com/api`

> After deploying the backend, update `CLIENT_URL` on Render to point to your frontend URL so CORS is correctly configured.

---

## Features

- Browse accommodation listings with filters (type, price, bedrooms, location)
- View detailed listing pages with image gallery and cost calculator
- User registration and login with JWT authentication
- Make and manage reservations
- Admin dashboard to create, edit, and delete listings with image upload
- Role-based access control (user / host / admin)
- Paginated API with MongoDB indexes for performance
- Full test suite for all major API endpoints
