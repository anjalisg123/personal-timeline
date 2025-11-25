Personal Timeline Project

Overview

Personal Timeline is a full-stack web application that serves as a digital journal. It allows users to track personal events, achievements, and activities manually or by automatically syncing with third-party digital services.

This project was built to demonstrate mastery of full-stack development using .NET 8 (Backend) and React + TypeScript (Frontend), incorporating OAuth authentication, Entity Framework Core, and complex API integrations.

🛠 Tech Stack

Backend

Framework: .NET 8 (Minimal API)

Database: SQLite (Development)

ORM: Entity Framework Core

Authentication: JWT (JSON Web Tokens) & Google OAuth

Documentation: Swagger / OpenAPI

Frontend

Framework: React 18

Build Tool: Vite

Language: TypeScript

Styling: CSS Modules / Tailwind-like utility classes

Routing: React Router DOM

State Management: React Context API

📋 Prerequisites

Before running this application, ensure you have the following installed on your machine:

Node.js (v18 or higher) - Download Here

A Code Editor (VS Code recommended)

🚀 Setup & Installation Instructions

Follow these steps to run the application locally from scratch.

1. Clone the Repository

git clone <YOUR_REPO_URL_HERE>
cd <YOUR_REPO_NAME>


2. Backend Setup (.NET)

Navigate to the backend project directory (e.g., TimelineApi):

cd TimelineApi


Install Dependencies & Restore Packages:
The project uses Entity Framework Core. Run the following commands to restore dependencies:

dotnet restore


Database Setup:
This project uses SQLite. You must apply the migrations to create the local database file (app.db).

# Install EF Core tools globally if you haven't already
dotnet tool install --global dotnet-ef

# Apply migrations to create the database
dotnet ef database update


Configuration (appsettings.json):
Ensure your appsettings.Development.json contains the necessary API keys.
Note: For security, actual API keys may not be in the repo. You can run the app without them, but Sync features will not work until keys are added.

Run the Backend:

dotnet run


The backend server should now be running at http://localhost:5001.

3. Frontend Setup (React)

Open a new terminal window and navigate to the frontend directory (e.g., client or frontend):

cd frontend


Install Node Modules:

npm install


Run the Frontend:

npm run dev


The frontend application should now be accessible at http://localhost:5173.

🔑 Configuration & Environment Variables

To fully utilize the Third-Party Sync features (GitHub, Strava, Spotify) and Google Login, you need to configure your secrets.

In TimelineApi/appsettings.Development.json:

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


✨ Features & Requirements Met

1. Authentication System ✅

OAuth Integration: Google Sign-In implemented on Frontend & Backend.

User Management: Users are stored in SQLite with OAuth IDs.

Protected Routes: API endpoints secured with [Authorize]; Frontend routes protected via ProtectedRoute wrapper.

Session: JWT implementation for secure stateless sessions.

2. Personal Timeline Management ✅

CRUD: Full Create, Read, Update, Delete capabilities for timeline entries.

Rich Content: Support for Image Uploads and File Attachments.

Metadata: Dedicated view for complex data from APIs (e.g., Strava distance, Spotify track info).

Filtering: Filter by Date Range, Entry Type, and Source.

Timezone Handling: Correctly handles UTC to Local time conversion for entries.

3. Third-Party API Integration ✅

GitHub: Syncs Push Events and Pull Requests automatically.

Strava: Syncs Runs, Rides, and Workouts with distance and type.

Spotify: Syncs recently played tracks.

Sync Logic: "Sync Now" button checks for duplicates before adding new entries.

4. Database Design ✅

Entity Framework Core: Used for all data access.

Entities:

User: Stores profile and OAuth info.

TimelineEntry: Polymorphic storage for manual notes and API data.

ApiConnection: Manages tokens and sync status (Active/Inactive).

🧪 Testing the API

You can explore the API endpoints directly via Swagger UI when the backend is running.

URL: http://localhost:5001/swagger/index.html

Key Endpoints:

GET /api/me - Get current user profile.

GET /api/entries - Get all timeline entries.

POST /api/upload - Handle file uploads.

POST /api/connections/{provider}/sync - Trigger data sync.

📝 Troubleshooting

Images not loading?
Ensure the Backend is running on port 5001. The frontend proxies image requests to the backend http://localhost:5001/api/files/.

Database Error on startup?
Make sure you ran dotnet ef database update to generate the app.db file.

CORS Error?
The backend is configured to allow localhost:5173. Ensure you are running the frontend on that specific port.