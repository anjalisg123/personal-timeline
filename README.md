# Personal Timeline Project

## Overview

Personal Timeline is a full-stack web application that serves as a digital journal. It allows users to track personal events, achievements, and activities manually or by automatically syncing with third-party digital services.

This project was built to demonstrate mastery of full-stack development using **.NET 8 (Backend)** and **React + TypeScript (Frontend)**, incorporating **OAuth authentication**, **Entity Framework Core**, and **complex API integrations**.

---

## 🛠 Tech Stack

### **Backend**

* **Framework:** .NET 8 (Minimal API)
* **Database:** SQLite (Development)
* **ORM:** Entity Framework Core
* **Authentication:** JWT (JSON Web Tokens) & Google OAuth
* **Documentation:** Swagger / OpenAPI

### **Frontend**

* **Framework:** React 18
* **Build Tool:** Vite
* **Language:** TypeScript
* **Styling:** CSS Modules / Tailwind-like utility classes
* **Routing:** React Router DOM
* **State Management:** React Context API

---

## 📋 Prerequisites

Before running this application, ensure you have the following installed on your machine:

* **Node.js (v18 or higher)**
* **A Code Editor (VS Code recommended)**
* **.NET 8 SDK**

---

## 🚀 Setup & Installation Instructions

Follow these steps to run the application locally from scratch.

---

## 1. Clone the Repository

```bash
git clone <YOUR_REPO_URL_HERE>
cd <YOUR_REPO_NAME>
```

---

## 2. Backend Setup (.NET)

Navigate to the backend project directory (e.g., `TimelineApi`):

```bash
cd TimelineApi
```

### Install Dependencies & Restore Packages

```bash
dotnet restore
```

### Database Setup

This project uses SQLite. You must apply the migrations to create the local database file (`app.db`).

```bash
# Install EF Core tools globally

dotnet tool install --global dotnet-ef

# Apply migrations
dotnet ef database update
```

### Configuration (`appsettings.json`)

Ensure your `appsettings.Development.json` contains the required API keys.

*You can run the app without third‑party keys, but sync features won't work.*

### Run the Backend

Run this command to start the server on port **5001**:

```bash
dotnet run --urls "http://localhost:5001"
```

The backend server will be available at:

```
http://localhost:5001
```

---

## 3. Frontend Setup (React)

Navigate to your frontend folder:

```bash
cd frontend
```

### Install Node Modules

```bash
npm install
```

### Run the Frontend

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

## 🔑 Configuration & Environment Variables

To fully enable third‑party sync (GitHub, Strava, Spotify) and Google Login, set the following in:

```
TimelineApi/appsettings.Development.json
```

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "Sqlite": "Data Source=app.db"
  },
  "Jwt": {
    "Key": "YOUR_SUPER_SECRET_LONG_KEY_HERE_MUST_BE_32_CHARS",
    "Issuer": "TimelineApi",
    "Audience": "TimelineUser"
  },
  "GoogleAuth": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID"
  },
  "GitHub": {
    "ClientId": "YOUR_GITHUB_ID",
    "ClientSecret": "YOUR_GITHUB_SECRET",
    "RedirectUri": "http://localhost:5001/api/oauth/github/callback"
  },
  "Strava": {
    "ClientId": "YOUR_STRAVA_ID",
    "ClientSecret": "YOUR_STRAVA_SECRET"
  },
  "Spotify": {
    "ClientId": "YOUR_SPOTIFY_ID",
    "ClientSecret": "YOUR_SPOTIFY_SECRET",
    "RedirectUri": "http://localhost:5001/api/oauth/spotify/callback"
  },
  "App": {
    "FrontendBase": "http://localhost:5173"
  }
}
```

---

## ✨ Features & Requirements Met

### **1. Authentication System ✔️**

* Google OAuth Login
* JWT‑based session management
* Protected routes
* User stored with OAuth IDs

### **2. Personal Timeline Management ✔️**

* Full CRUD for timeline entries
* Image & file uploads
* Polymorphic metadata for API entries
* Filters: date range, entry type, source
* Local timezone conversion

### **3. Third‑Party API Integrations ✔️**

* GitHub: Sync push events, pull requests
* Strava: Sync runs, rides, workouts
* Spotify: Sync recently played tracks
* Sync avoids duplicates

### **4. Database Design ✔️**

* User entity (OAuth + profile)
* TimelineEntry (manual + API entries)
* ApiConnection (tokens + sync status)
* Entity Framework Core for data access

---

## 🧪 Testing the API

Open Swagger UI:

```
http://localhost:5001/swagger/index.html
```

### Key Endpoints

* `GET /api/me` — get current user profile
* `GET /api/entries` — list timeline entries
* `POST /api/upload` — upload files
* `POST /api/connections/{provider}/sync` — sync external services

---

## 📝 Troubleshooting

### **Images not loading?**

Backend must run on **port 5001**.

### **Database errors?**

Ensure:

```bash
dotnet ef database update
```

was executed.

### **CORS issues?**

Frontend must run on:

```
http://localhost:5173
```

---

If you'd like, I can also:

* Add screenshots
* Add architecture diagrams
* Add badges (build, license, tech stack)
* Format this README more beautifully
