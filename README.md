[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/McwNAtjG)
Collecting workspace information# Personal Timeline Project - Final Assignment

## Overview
Create a comprehensive Personal Timeline application that combines all the skills you've learned throughout the course. This full-stack application will serve as a digital journal/timeline where users can track personal events, achievements, and activities by integrating with third-party APIs to automatically populate timeline entries from various aspects of their digital life.

## Learning Objectives
By completing this final project, you will demonstrate mastery of:
- Entity Framework Core with persistent database storage
- OAuth authentication integration (Google, GitHub, etc.)
- Third-party API integration and data management
- Advanced React patterns with TypeScript
- Full-stack application architecture
- RESTful API design with authentication
- Database relationships and data modeling
- Asynchronous programming patterns
- Error handling and user experience design
- Modern web development best practices

## Project Requirements

### Core Features (Required)

#### 1. Authentication System
- **OAuth Integration**: Implement OAuth authentication with Google, GitHub, or Microsoft
- **User Management**: Store authenticated user profiles in the database
- **Protected Routes**: Secure both frontend routes and API endpoints
- **Session Management**: Maintain user sessions with proper token handling
- **Role-Based Access**: Users can only access their own timeline data

#### 2. Personal Timeline Management
- **Timeline Entries**: Create, read, update, delete personal timeline events
- **Entry Types**: Support multiple entry types (achievement, activity, milestone, memory)
- **Rich Content**: Support text, images, links, and metadata for each entry
- **Categorization**: Organize entries by categories/tags
- **Date Management**: Precise date/time tracking with timezone support
- **Search & Filter**: Advanced search across timeline entries

#### 3. Third-Party API Integration
- **Choose 2-3 APIs**: Integrate with at least 2-3 different third-party services
- **Automatic Population**: Automatically create timeline entries from API data
- **Data Synchronization**: Regular syncing of new activities/events
- **API Management**: Handle rate limits, authentication, and error scenarios
- **Data Transformation**: Convert API data into timeline entry format

#### 4. Database Design with Entity Framework
- **User Entities**: User profiles with OAuth provider information
- **Timeline Entities**: Timeline entries with relationships
- **API Integration Entities**: Store API connections and sync status
- **Migration Management**: Proper database schema versioning
- **Seed Data**: Sample data for development and testing
- **Relationships**: Proper foreign keys and navigation properties

### Technical Stack Requirements

#### Backend (.NET 8 Minimal API)
- **Entity Framework Core**: SQLite for development, support for production databases
- **OAuth Middleware**: Microsoft.AspNetCore.Authentication.OAuth or similar
- **API Documentation**: Swagger/OpenAPI documentation
- **CORS Configuration**: Proper CORS setup for React frontend
- **Error Handling**: Comprehensive error handling and logging
- **Background Services**: Optional background jobs for API synchronization

#### Frontend (React + TypeScript)
- **Context API**: Global state management for user and timeline data
- **React Router**: Multi-page application with protected routes
- **Custom Hooks**: Reusable logic for API calls, authentication, and data management
- **TypeScript**: Comprehensive typing throughout the application
- **Responsive Design**: Mobile-friendly interface
- **Performance Optimization**: useMemo, useCallback for performance

## Detailed Implementation Requirements

### 1. Database Schema Design (Example)

#### Core Entities
```csharp
public class User
{
    public int Id { get; set; }
    public string OAuthProvider { get; set; }
    public string OAuthId { get; set; }
    public string Email { get; set; }
    public string DisplayName { get; set; }
    public string ProfileImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastLoginAt { get; set; }
    
    // Navigation properties
    public ICollection<TimelineEntry> TimelineEntries { get; set; }
    public ICollection<ApiConnection> ApiConnections { get; set; }
}

public class TimelineEntry
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime EventDate { get; set; }
    public string EntryType { get; set; } // Achievement, Activity, Milestone, Memory
    public string Category { get; set; }
    public string ImageUrl { get; set; }
    public string ExternalUrl { get; set; }
    public string SourceApi { get; set; } // Which API this came from
    public string ExternalId { get; set; } // ID from external API
    public string Metadata { get; set; } // JSON for additional data
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public User User { get; set; }
}

public class ApiConnection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string ApiProvider { get; set; }
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public DateTime TokenExpiresAt { get; set; }
    public DateTime LastSyncAt { get; set; }
    public bool IsActive { get; set; }
    public string Settings { get; set; } // JSON for API-specific settings
    
    // Navigation properties
    public User User { get; set; }
}
```

### 2. Authentication Implementation

#### OAuth Setup
- Configure OAuth provider in `Program.cs`
- Implement OAuth callback handling
- Store user information in database
- Generate and manage JWT tokens for API access
- Handle token refresh and expiration

#### Frontend Authentication
- Login/logout components
- Protected route wrapper
- Authentication context provider
- Token storage and management
- Automatic token refresh

### 3. Third-Party API Integration

#### API Service Layer
```csharp
public interface IThirdPartyApiService
{
    Task<IEnumerable<TimelineEntry>> SyncUserDataAsync(int userId, string apiProvider);
    Task<bool> ConnectApiAsync(int userId, string apiProvider, string accessToken);
    Task<bool> DisconnectApiAsync(int userId, string apiProvider);
}
```

#### Background Synchronization (Optional)
- Background service to periodically sync API data
- Queue-based processing for API calls
- Error handling and retry logic
- User notification of sync status

### 4. Frontend Implementation

#### Page Structure
- **Authentication Pages**: Login, callback handling
- **Dashboard**: Overview of timeline with recent entries
- **Timeline Page**: Full timeline view with filtering/searching
- **Settings Page**: Manage API connections and preferences
- **Profile Page**: User profile management

#### Component Architecture
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── OAuthCallback.tsx
│   │   └── ProtectedRoute.tsx
│   ├── timeline/
│   │   ├── TimelineView.tsx
│   │   ├── TimelineEntry.tsx
│   │   ├── EntryForm.tsx
│   │   └── EntryFilter.tsx
│   ├── settings/
│   │   ├── ApiConnections.tsx
│   │   └── UserProfile.tsx
│   └── layout/
│       ├── Navigation.tsx
│       ├── Header.tsx
│       └── Footer.tsx
├── context/
│   ├── AuthContext.tsx
│   └── TimelineContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTimeline.ts
│   ├── useApiSync.ts
│   └── useLocalStorage.ts
├── services/
│   ├── authService.ts
│   ├── timelineService.ts
│   └── apiService.ts
└── types/
    ├── User.ts
    ├── TimelineEntry.ts
    └── ApiConnection.ts
```

## Third-Party API Integration Options

### Fitness & Health APIs
1. **Strava API** (Free)
   - Running, cycling, and fitness activities
   - Personal records and achievements
   - Route maps and activity photos
   - [Developer Docs](https://developers.strava.com/)

2. **Fitbit Web API** (Free)
   - Step counts, heart rate, sleep data
   - Activity summaries and goals
   - [Developer Docs](https://dev.fitbit.com/build/reference/web-api/)

3. **MyFitnessPal API** (Paid/Limited Free)
   - Nutrition and diet tracking
   - Weight and measurement logs
   - [Developer Docs](https://www.myfitnesspal.com/api)

### Social Media & Communication APIs
4. **Twitter API v2** (Free Tier Available and does work!)
   - Tweet history and engagement
   - Personal Twitter timeline
   - [Developer Docs](https://developer.twitter.com/en/docs/twitter-api)

5. **Instagram Basic Display API** (Free)
   - Personal Instagram posts and media
   - Photo timeline integration
   - [Developer Docs](https://developers.facebook.com/docs/instagram-basic-display-api)

6. **Discord API** (Free and does work!)
   - Server participation and messages
   - Gaming activity tracking
   - [Developer Docs](https://discord.com/developers/docs/intro)

### Development & Professional APIs
7. **GitHub API** (Free)
   - Repository commits and contributions
   - Project milestones and releases
   - [Developer Docs](https://docs.github.com/en/rest)

8. **GitLab API** (Free)
   - Code commits and project activity
   - Merge requests and issues
   - [Developer Docs](https://docs.gitlab.com/ee/api/)

9. **LinkedIn API** (Limited Free)
   - Professional updates and connections
   - Job changes and skills
   - [Developer Docs](https://docs.microsoft.com/en-us/linkedin/)

### Entertainment & Media APIs
10. **Spotify Web API** (Free)
    - Music listening history
    - Top tracks and artists
    - Playlist creation timeline
    - [Developer Docs](https://developer.spotify.com/documentation/web-api/)

11. **Last.fm API** (Free)
    - Music scrobbling and listening history
    - Concert attendance and music discovery
    - [Developer Docs](https://www.last.fm/api)

12. **Goodreads API** (Free but Limited)
    - Reading history and book reviews
    - Reading challenges and goals
    - [Developer Docs](https://www.goodreads.com/api)

### Travel & Location APIs
13. **Foursquare Places API** (Free Tier)
    - Check-ins and location history
    - Venue visits and travel timeline
    - [Developer Docs](https://developer.foursquare.com/)

14. **Google Maps Timeline API** (Free Tier)
    - Location history and travel patterns
    - Visited places and routes
    - [Developer Docs](https://developers.google.com/maps/documentation)

### Productivity & Learning APIs
15. **Todoist API** (Free)
    - Task completion and productivity metrics
    - Project milestones and achievements
    - [Developer Docs](https://developer.todoist.com/rest/v2/)

16. **Trello API** (Free)
    - Board activity and card movements
    - Project progress tracking
    - [Developer Docs](https://developer.atlassian.com/cloud/trello/)

17. **Notion API** (Free)
    - Page creation and content updates
    - Database entries and properties
    - [Developer Docs](https://developers.notion.com/)

### Gaming APIs
18. **Steam Web API** (Free)
    - Game achievements and playtime
    - Purchase history and library growth
    - [Developer Docs](https://steamcommunity.com/dev)

19. **Xbox Live API** (Free)
    - Gaming achievements and progress
    - Game completion timeline
    - [Developer Docs](https://docs.microsoft.com/en-us/gaming/xbox-live/)

### Finance & Shopping APIs
20. **Plaid API** (Free Tier)
    - Transaction history and spending patterns
    - Financial milestones and goals
    - [Developer Docs](https://plaid.com/docs/)

## Implementation Phases

### Phase 1: Authentication & Database Setup 
1. Set up Entity Framework with SQLite
2. Implement OAuth authentication
3. Create user management system
4. Basic frontend authentication flow

### Phase 2: Core Timeline Features 
1. Implement timeline CRUD operations
2. Create timeline UI components
3. Add search and filtering
4. Implement image upload functionality

### Phase 3: Third-Party API Integration
1. Choose and implement 2-3 API integrations
2. Create data synchronization logic
3. Build API connection management UI
4. Handle authentication for external APIs

### Phase 4: Polish & Advanced Features 
1. Implement background synchronization
2. Add performance optimizations
3. Comprehensive error handling
4. UI/UX improvements and responsive design

## Submission Requirements

### Required Deliverables
1. **Complete Source Code**: Both frontend and backend with clear organization
2. **Database Migrations**: All Entity Framework migrations
3. **API Documentation**: Swagger documentation for all endpoints
4. **Setup Instructions**: Complete README with setup and deployment instructions
5. **Demo Video**: 5 minute video demonstrating all features (do not make it longer than 5 minutes)
6. **Third-Party API Integration**: At least 2 working API integrations
7. **Authentication**: Working OAuth authentication
8. **Database**: Persistent storage with Entity Framework

### Code Quality Requirements
1. **TypeScript**: Full TypeScript implementation with proper typing
2. **Error Handling**: Comprehensive error handling throughout
3. **Testing**: Basic unit tests for critical functions
4. **Code Organization**: Clean, well-organized code structure
5. **Documentation**: Code comments and API documentation
6. **Security**: Proper handling of API keys and user data

### Feature Requirements
1. **CRUD Operations**: Full timeline entry management
2. **Authentication**: OAuth login/logout with user sessions
3. **API Integration**: Working integration with external APIs
4. **Data Persistence**: All data stored in database with Entity Framework
5. **Responsive Design**: Mobile-friendly interface
6. **Search & Filter**: Advanced timeline search capabilities
7. **Real-time Updates**: Live updates when data changes



## Resources & Support

### Documentation Links
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core OAuth Documentation](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/oauth)
- [React Authentication Patterns](https://reactjs.org/docs/context.html)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)

### Getting Help
1. Review previous assignment solutions for patterns
2. Study the Entity Framework examples from Assignment 5
3. Reference Context API patterns from Assignment 3
4. Check API documentation for integration examples
5. Use developer tools for debugging API calls

## Tips for Success

1. **Start Early**: Begin with authentication and database setup
2. **Choose APIs Wisely**: Pick APIs with good documentation and free tiers
3. **Plan Your Database Schema**: Design relationships carefully from the start
4. **Handle Errors Gracefully**: Plan for API failures and rate limits
5. **Keep Secrets Secure**: Never commit API keys or tokens
6. **Test Frequently**: Test each feature as you build it
7. **Document Everything**: Keep track of API keys, endpoints, and configurations

## Final Notes

This project combines everything you've learned throughout the course into a comprehensive, real-world application. Focus on creating a polished, professional application that demonstrates your mastery of full-stack web development. The integration with third-party APIs should feel natural and add genuine value to the personal timeline experience.

Your timeline should tell a story about the user's digital life, automatically populated with their activities, achievements, and experiences from various platforms. Make it personal, useful, and something you'd be proud to show to potential employers.

Good luck! 🚀

---

**Remember**: This is a capstone project that showcases your full-stack development skills. Quality over quantity - it's better to have fewer features that work perfectly than many features that are buggy or incomplete.
