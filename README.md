# Personal Timeline Project

📺 Demo Video
https://drive.google.com/file/d/1AmwsbcHlZ6Az4vyU5LjgF3OY1aQkOMVA/view?usp=sharing

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

Before running this application, ensure you have the following installed:

* **Node.js (v18 or higher)**
* **VS Code or any preferred editor**
* **.NET 8 SDK**

---

## 🚀 Setup & Installation Instructions

Follow these steps to run the application locally.

### **1. Clone the Repository**

```bash
git clone <YOUR_REPO_URL_HERE>
cd <YOUR_REPO_NAME>
```

---

## 2. Backend Setup (.NET)

Navigate to the backend directory:

```bash
cd TimelineApi
```

### Install Dependencies

```bash
dotnet restore
```

### Database Setup

```bash
# Install EF Core tools
dotnet tool install --global dotnet-ef

# Apply migrations
dotnet ef database update
```

### Configuration

Ensure `appsettings.Development.json` contains the required secrets.

### Run Backend

```bash
dotnet run --urls "http://localhost:5001"
```

Backend will run at:

```
http://localhost:5001
```

Swagger UI:

```
http://localhost:5001/swagger/index.html
```

---

## 3. Frontend Setup (React)

Navigate:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Accessible at:

```
http://localhost:5173
```

---

## 📚 API Documentation (Swagger)

Access Swagger at:

```
http://localhost:5001/swagger/index.html
```

### Authorizing Swagger with JWT

1. Login in the frontend (Google Sign-In).
2. Open DevTools → Application → Local Storage.
3. Copy value of `pt_jwt`.
4. In Swagger → Authorize → enter:

```
Bearer <TOKEN>
```

You can now test protected endpoints.

---

## 🔑 Configuration & Environment Variables

File: `TimelineApi/appsettings.Development.json`

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

### **1. Authentication System**

* Google OAuth Login
* JWT-secured API
* Protected routes
* Stateless session handling

### **2. Personal Timeline Management**

* Full CRUD for entries
* Image & file uploads
* Polymorphic metadata
* Filters: date, source, type
* Automatic timezone correction

### **3. Third-Party Integrations**

* GitHub: push & PR sync
* Strava: workouts sync
* Spotify: recent tracks sync
* Duplicate prevention logic

### **4. Database Design**

* EF Core with SQLite
* User entity
* TimelineEntry entity
* ApiConnection entity

---

## 📝 Troubleshooting

### Images not loading?

Backend must run on **port 5001**.

### Database error on startup?

Run:

```bash
dotnet ef database update
```

### CORS error?

Frontend must run on:

```
http://localhost:5173
```

