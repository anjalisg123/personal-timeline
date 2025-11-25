A small full-stack Personal Timeline app: .NET 8 minimal API backend (EF Core + SQLite) and a Vite React frontend. Includes Google One-Tap auth, JWT auth for API calls, and provider connections (GitHub, Spotify, Strava, Todoist) with sync stubs.

1. Prerequisites
Install the following on your machine:
1. .NET 8 SDK
2. Node.js (v16+ recommended) and npm (or yarn/pnpm if you prefer)
3. Git
4. (Optional) dotnet-ef tool for applying migrations easily:
    dotnet tool install --global dotnet-ef
On macOS you may use Homebrew to install dotnet / node if needed.

2. Backend — setup & run
Project location: backend/TimelineApi
Install & restore
From project root (or backend/TimelineApi):
cd personal-timeline/backend/TimelineApi
dotnet restore

Run the app (development)
To run with the default URL used during development:
# from personal-timeline/backend/TimelineApi
dotnet run --urls http://localhost:5001
This will build and start the minimal API on port 5001 (you can change the url if needed).

3. Frontend — setup & run
Project location: frontend (or the Vite app folder)
Install dependencies
From the frontend folder:
cd frontend
npm install

Run dev server
# from frontend
npm run dev

The Vite dev server will start (usually on http://localhost:5173). It will use VITE_API_URL to call the backend when USE_API=true.
Build for production
npm run build
npm run preview 

4. Environment variables (examples)
Frontend (.env.local)
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
USE_API=true