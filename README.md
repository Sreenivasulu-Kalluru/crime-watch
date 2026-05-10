# 🛡️ CrimeWatch — Real-Time Crime Reporting System

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Sreenivasulu-Kalluru/crime-watch)

A civic engagement platform where users can report crimes anonymously with geolocation tagging, photos, and videos. Authorities can view incidents on a real-time map and respond accordingly.

## 🚀 Tech Stack

- **Frontend:** Next.js (React) + Leaflet.js Maps
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Real-Time:** Socket.IO
- **Auth:** JWT (JSON Web Tokens)
- **File Uploads:** Multer

## 📋 Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Role-Based Access (Citizen, Authority, Admin)
- ✅ Crime Report Submission with geolocation & media upload
- ✅ Anonymous Reporting Mode
- ✅ Live Interactive Crime Map (Leaflet + OpenStreetMap)
- ✅ Real-Time Updates via Socket.IO
- ✅ Real-Time In-App Notifications
- ✅ Category & Severity Filters
- ✅ Report Status Tracking (Pending → Investigating → Resolved)
- ✅ Admin Dashboard with Statistics
- ✅ User Management Panel
- ✅ Responsive Mobile-First UI

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

**Backend Environment (`server/.env`):**
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/crime-reporting
JWT_SECRET=your_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000 # Optional for local development
```

**Frontend Environment (`client/.env.local`):**
Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run the Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000>

## 📁 Project Structure

```text
crime-reporting-system/
├── client/          # Next.js Frontend
│   └── src/
│       ├── app/         # Pages (App Router)
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth & Socket context
│       └── services/    # API functions
│
└── server/          # Express Backend
    ├── config/      # DB connection
    ├── controllers/ # Business logic
    ├── middleware/   # Auth & upload
    ├── models/      # MongoDB schemas
    ├── routes/      # API routes
    └── socket/      # Socket.IO handlers
```

## 🔑 User Roles

| Role | Permissions |
| ------ | ------------ |
| **Citizen** | Submit reports, view reports & map |
| **Authority** | All citizen perms + Update report status |
| **Admin** | All perms + User management, delete reports |

## 📡 API Endpoints

| Method | Endpoint | Description |
| -------- | ---------- | ------------- |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/reports` | List all reports |
| POST | `/api/reports` | Create a report |
| GET | `/api/reports/:id` | Get report details |
| PUT | `/api/reports/:id/status` | Update status |
| GET | `/api/reports/stats` | Get statistics |
| GET | `/api/admin/users` | List users (admin) |
| PUT | `/api/admin/users/:id/role` | Change role (admin) |
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |

## 👨‍💻 Author

### Sreenivasulu Kalluru

- [GitHub Profile](https://github.com/Sreenivasulu-Kalluru)
