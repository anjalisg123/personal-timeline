using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TimelineApi.Data;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Net.Http.Headers;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;
var oauthStates = new ConcurrentDictionary<string,int>(); 


// ---------- CORS (Vite dev) ----------
builder.Services.AddCors(o => o.AddPolicy("spa", p => p
    .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173",
                 "http://localhost:5174", "http://127.0.0.1:5174")
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

// ---------- Auth ----------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
      options.TokenValidationParameters = new TokenValidationParameters
      {
          ValidateIssuer = true,
          ValidateAudience = true,
          ValidateLifetime = true,
          ValidateIssuerSigningKey = true,
          ValidIssuer = cfg["Jwt:Issuer"],
          ValidAudience = cfg["Jwt:Audience"],
          IssuerSigningKey = new SymmetricSecurityKey(
              Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!))
      };
  });

builder.Services.AddAuthorization();

builder.Services.AddControllers();


// ---------- SWAGGER SETUP WITH AUTH BUTTON (NEW) ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});



// ---------- EF Core ----------
builder.Services.AddDbContext<AppDb>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Sqlite")));

var app = builder.Build();

// ---------- SWAGGER MIDDLEWARE (NEW) ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ---------- Migrate on startup ----------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDb>();
    await db.Database.MigrateAsync();
}

app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();

// ================== Helpers ==================
static int? GetUserIdInt(ClaimsPrincipal user)
{

    var uid = user.FindFirst("uid")?.Value
           ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
           ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return int.TryParse(uid, out var id) ? id : null;
}


string BuildStravaAuthorizeUrl(HttpRequest req, IConfiguration cfg, string state) {
    var cid = cfg["Strava:ClientId"];
    if (string.IsNullOrWhiteSpace(cid))
        throw new InvalidOperationException("Strava:ClientId is missing in configuration.");


    var redirectCfg = cfg["Strava:RedirectUri"];
    var redirect = string.IsNullOrWhiteSpace(redirectCfg)
        ? $"{req.Scheme}://{req.Host}/api/oauth/strava/callback"
        : redirectCfg;

    var scopes = "read,activity:read,activity:read_all";
    return $"https://www.strava.com/oauth/authorize" +
           $"?client_id={Uri.EscapeDataString(cid)}" +
           $"&response_type=code" +
           $"&redirect_uri={Uri.EscapeDataString(redirect)}" +
           $"&approval_prompt=auto" +
           $"&scope={Uri.EscapeDataString(scopes)}" +
           $"&state={Uri.EscapeDataString(state)}";
}



async Task<(string access, string refresh, DateTime expiresAtUtc, long athleteId)>
ExchangeStravaTokenAsync(IConfiguration cfg, string code) {
    using var hc = new HttpClient();
    var form = new Dictionary<string,string> {
        ["client_id"] = cfg["Strava:ClientId"]!,
        ["client_secret"] = cfg["Strava:ClientSecret"]!,
        ["code"] = code,
        ["grant_type"] = "authorization_code"
    };
    var resp = await hc.PostAsync("https://www.strava.com/oauth/token", new FormUrlEncodedContent(form));
    resp.EnsureSuccessStatusCode();
    var json = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement;

    var access  = json.GetProperty("access_token").GetString()!;
    var refresh = json.GetProperty("refresh_token").GetString()!;
    var exp     = DateTimeOffset.FromUnixTimeSeconds(json.GetProperty("expires_at").GetInt64()).UtcDateTime;
    var athlete = json.GetProperty("athlete").GetProperty("id").GetInt64();
    return (access, refresh, exp, athlete);
}


async Task<string> EnsureStravaAccessTokenAsync(ApiConnection row, IConfiguration cfg, AppDb db) {
    if (row.TokenExpiresAt.HasValue && row.TokenExpiresAt.Value > DateTime.UtcNow.AddMinutes(2))
        return row.AccessToken!;

    using var hc = new HttpClient();
    var form = new Dictionary<string,string> {
        ["client_id"] = cfg["Strava:ClientId"]!,
        ["client_secret"] = cfg["Strava:ClientSecret"]!,
        ["grant_type"] = "refresh_token",
        ["refresh_token"] = row.RefreshToken!
    };
    var resp = await hc.PostAsync("https://www.strava.com/oauth/token", new FormUrlEncodedContent(form));
    resp.EnsureSuccessStatusCode();
    var json = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement;

    row.AccessToken  = json.GetProperty("access_token").GetString()!;
    row.RefreshToken = json.GetProperty("refresh_token").GetString()!;
    row.TokenExpiresAt = DateTimeOffset.FromUnixTimeSeconds(json.GetProperty("expires_at").GetInt64()).UtcDateTime;
    await db.SaveChangesAsync();
    return row.AccessToken!;
}

string CreateJwt(int internalUserId, string? email, string? name, string? googleSub)
{
    var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
        new("uid", internalUserId.ToString()),              
        new(JwtRegisteredClaimNames.Sub, googleSub ?? ""), 
        new(JwtRegisteredClaimNames.Email, email ?? string.Empty),
        new("name", name ?? string.Empty)
    };

    var token = new JwtSecurityToken(
        issuer: cfg["Jwt:Issuer"],
        audience: cfg["Jwt:Audience"],
        claims: claims,
        notBefore: DateTime.UtcNow,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}



// ====== Spotify helpers ======
string BuildSpotifyAuthorizeUrl(HttpRequest req, IConfiguration cfg, string state)
{
    var cid = cfg["Spotify:ClientId"] ?? throw new InvalidOperationException("Spotify:ClientId missing");
    var redirectCfg = cfg["Spotify:RedirectUri"];
    var redirect = string.IsNullOrWhiteSpace(redirectCfg)
        ? $"{req.Scheme}://{req.Host}/api/oauth/spotify/callback"
        : redirectCfg;


    var scopes = "user-read-recently-played user-read-currently-playing user-top-read";
    return "https://accounts.spotify.com/authorize"
         + $"?client_id={Uri.EscapeDataString(cid)}"
         + $"&response_type=code"
         + $"&redirect_uri={Uri.EscapeDataString(redirect)}"
         + $"&scope={Uri.EscapeDataString(scopes)}"
         + $"&state={Uri.EscapeDataString(state)}";
}

async Task<(string access, string refresh, DateTime expiresUtc)>
ExchangeSpotifyTokenAsync(IConfiguration cfg, string code)
{
    using var hc = new HttpClient();
    var redirect = cfg["Spotify:RedirectUri"]!;
    var form = new Dictionary<string,string> {
        ["grant_type"] = "authorization_code",
        ["code"] = code,
        ["redirect_uri"] = redirect,
        ["client_id"] = cfg["Spotify:ClientId"]!,
        ["client_secret"] = cfg["Spotify:ClientSecret"]!
    };
    var resp = await hc.PostAsync("https://accounts.spotify.com/api/token", new FormUrlEncodedContent(form));
    resp.EnsureSuccessStatusCode();
    var json = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement;

    var access = json.GetProperty("access_token").GetString()!;
    var refresh = json.GetProperty("refresh_token").GetString()!;
    var expiresIn = json.GetProperty("expires_in").GetInt32(); 
    return (access, refresh, DateTime.UtcNow.AddSeconds(expiresIn - 60));
}

async Task<string> EnsureSpotifyAccessTokenAsync(ApiConnection row, IConfiguration cfg, AppDb db)
{
    if (row.TokenExpiresAt.HasValue && row.TokenExpiresAt.Value > DateTime.UtcNow.AddMinutes(1))
        return row.AccessToken!;

    using var hc = new HttpClient();
    var form = new Dictionary<string,string> {
        ["grant_type"] = "refresh_token",
        ["refresh_token"] = row.RefreshToken!,
        ["client_id"] = cfg["Spotify:ClientId"]!,
        ["client_secret"] = cfg["Spotify:ClientSecret"]!
    };
    var resp = await hc.PostAsync("https://accounts.spotify.com/api/token", new FormUrlEncodedContent(form));
    resp.EnsureSuccessStatusCode();
    var json = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement;

    row.AccessToken = json.GetProperty("access_token").GetString()!;

    if (json.TryGetProperty("refresh_token", out var rtk) && rtk.GetString() is string newRef && !string.IsNullOrEmpty(newRef))
        row.RefreshToken = newRef;

    var expiresIn = json.GetProperty("expires_in").GetInt32();
    row.TokenExpiresAt = DateTime.UtcNow.AddSeconds(expiresIn - 60);
    await db.SaveChangesAsync();
    return row.AccessToken!;
}


// ====== GitHub helpers ======
string BuildGitHubAuthorizeUrl(HttpRequest req, IConfiguration cfg, string state)
{
    var cid = cfg["GitHub:ClientId"] ?? throw new InvalidOperationException("GitHub:ClientId missing");
    var redirectCfg = cfg["GitHub:RedirectUri"];
    var redirect = string.IsNullOrWhiteSpace(redirectCfg)
        ? $"{req.Scheme}://{req.Host}/api/oauth/github/callback"
        : redirectCfg;


    var scope = "read:user,repo";
    return "https://github.com/login/oauth/authorize"
         + $"?client_id={Uri.EscapeDataString(cid)}"
         + $"&redirect_uri={Uri.EscapeDataString(redirect)}"
         + $"&scope={Uri.EscapeDataString(scope)}"
         + $"&state={Uri.EscapeDataString(state)}";
}

async Task<string> ExchangeGitHubTokenAsync(IConfiguration cfg, string code)
{
    using var hc = new HttpClient();
    var form = new Dictionary<string,string> {
        ["client_id"]     = cfg["GitHub:ClientId"]!,
        ["client_secret"] = cfg["GitHub:ClientSecret"]!,
        ["code"]          = code,
        ["redirect_uri"]  = cfg["GitHub:RedirectUri"]!
    };
    hc.DefaultRequestHeaders.Accept.ParseAdd("application/json");
    var resp = await hc.PostAsync("https://github.com/login/oauth/access_token", new FormUrlEncodedContent(form));
    resp.EnsureSuccessStatusCode();
    var json = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement;
    return json.GetProperty("access_token").GetString()!;
}


Task<string> EnsureGitHubAccessTokenAsync(ApiConnection row) =>
    Task.FromResult(row.AccessToken!);

// ================== Profile ==================
app.MapGet("/api/me", [Authorize] async (ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var me = await db.Users.FindAsync(uid.Value);
    if (me is null) return Results.NotFound();

    return Results.Ok(new
    {
        id = me.Id,
        email = me.Email,
        name = me.DisplayName,
        picture = me.ProfileImageUrl
    });
});

app.MapPut("/api/me", [Authorize] async (ClaimsPrincipal user, AppDb db, UpdateProfileReq body) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var me = await db.Users.FindAsync(uid.Value);
    if (me is null) return Results.NotFound();

    if (!string.IsNullOrWhiteSpace(body.name)) me.DisplayName = body.name;
    if (!string.IsNullOrWhiteSpace(body.picture)) me.ProfileImageUrl = body.picture;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ================== Entries (professor model) ==================
app.MapGet("/api/entries", [Authorize] async (ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var items = await db.Entries
        .Where(e => e.UserId == uid.Value)
        .OrderByDescending(e => e.EventDate)
        .Take(500)
        .Select(e => new {
            e.Id, e.Title, e.Description, e.EntryType, e.Category, e.SourceApi,
            e.EventDate, e.CreatedAt, e.ExternalUrl,
            e.FileAttachment, e.FileName, e.FileType, e.Metadata 
        })
        .ToListAsync();

    return Results.Ok(new { items });
});

app.MapPost("/api/entries", [Authorize] async (ClaimsPrincipal user, AppDb db, CreateEntryReqDto body) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var entryType = string.IsNullOrWhiteSpace(body.entryType) ? "Note" : body.entryType!.Trim();
    var src       = string.IsNullOrWhiteSpace(body.sourceApi) ? "manual" : body.sourceApi!.Trim();

    var e = new TimelineEntry {
        Title       = body.title,
        Description = body.description ?? "",         
        EntryType   = entryType,                      
        Category    = body.category ?? "",            
        SourceApi   = src,                            
        EventDate   = body.eventDate,
        ExternalUrl = body.externalUrl ?? "",         
        ImageUrl    = body.imageUrl ?? "",            
        ExternalId  = body.externalId ?? "",          
        Metadata    = body.metadata ?? "{}",   
        FileAttachment = body.fileAttachment ?? "", 
        FileName = body.fileName ?? "",              
        FileType = body.fileType ?? "",                   
        UserId      = uid.Value,
        CreatedAt   = DateTime.UtcNow,
        UpdatedAt   = DateTime.UtcNow
    };


    db.Entries.Add(e);
    await db.SaveChangesAsync();
    return Results.Created($"/api/entries/{e.Id}", e);
});

app.MapPut("/api/entries/{id}", [Authorize] async (int id, ClaimsPrincipal user, AppDb db, UpdateEntryReqDto body) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var e = await db.Entries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid.Value);
    if (e is null) return Results.NotFound();

    if (body.entryType is not null)
        e.EntryType = string.IsNullOrWhiteSpace(body.entryType) ? e.EntryType : body.entryType.Trim();
    if (body.title is not null)       e.Title       = body.title;
    if (body.description is not null) e.Description = body.description;
    if (body.category is not null)    e.Category    = body.category;
    if (body.sourceApi is not null)   e.SourceApi   = body.sourceApi;
    if (body.eventDate is not null)   e.EventDate   = body.eventDate.Value;
    if (body.externalUrl is not null) e.ExternalUrl = body.externalUrl;
    if (body.fileAttachment is not null) e.FileAttachment = body.fileAttachment;  
    if (body.fileName is not null) e.FileName = body.fileName;                    
    if (body.fileType is not null) e.FileType = body.fileType;                    

    e.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(e);
});

app.MapDelete("/api/entries/{id}", [Authorize] async (int id, ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var e = await db.Entries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid.Value);
    if (e is null) return Results.NotFound();

    db.Remove(e);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ================== Google Auth (professor user model) ==================
app.MapPost("/api/auth/google", async (GoogleLoginRequest req, AppDb db) =>
{
    if (string.IsNullOrWhiteSpace(req.IdToken))
        return Results.BadRequest(new { error = "Missing idToken" });

    var settings = new GoogleJsonWebSignature.ValidationSettings
    {
        Audience = new[] { cfg["GoogleAuth:ClientId"]! }
    };

    GoogleJsonWebSignature.Payload payload;
    try
    {
        payload = await GoogleJsonWebSignature.ValidateAsync(req.IdToken, settings);
    }
    catch (InvalidJwtException)
    {
        return Results.Unauthorized();
    }

    var googleSub = payload.Subject ?? "";
    var email     = payload.Email ?? "";
    var name      = payload.Name ?? email;
    var pic       = payload.Picture ?? "";

    var dbUser = await db.Users.FirstOrDefaultAsync(u =>
        u.OAuthProvider == "google" && u.OAuthId == googleSub);

    if (dbUser is null)
    {
        dbUser = new User
        {
            OAuthProvider   = "google",
            OAuthId         = googleSub,
            Email           = email,
            DisplayName     = name,
            ProfileImageUrl = pic,
            CreatedAt       = DateTime.UtcNow,
            LastLoginAt     = DateTime.UtcNow,
            TimelineEntries = new List<TimelineEntry>(),
            ApiConnections  = new List<ApiConnection>()
        };
        db.Users.Add(dbUser);
        await db.SaveChangesAsync(); 
    }
    else
    {
        dbUser.Email           = email;
        dbUser.DisplayName     = name;
        dbUser.ProfileImageUrl = pic;
        dbUser.LastLoginAt     = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    var jwt = CreateJwt(dbUser.Id, email, name, googleSub);

    return Results.Ok(new
    {
        token = jwt,
        user  = new { id = dbUser.Id, email, name, picture = pic }
    });
});

// ================== Health / Routes ==================
app.MapGet("/", () => new { ok = true, service = "TimelineApi" });
app.MapGet("/_routes", (IEnumerable<EndpointDataSource> sources) =>
    sources.SelectMany(s => s.Endpoints).Select(e => e.DisplayName));


// ================== Api Connections ==================


// ---- API Connections ----
app.MapGet("/api/connections", [Authorize] async (ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var rows = await db.Connections
        .Where(c => c.UserId == uid.Value)
        .Select(c => new {
            provider = c.ApiProvider,
            isActive = c.IsActive,
            lastSyncAt = c.LastSyncAt,
            settings = c.Settings
        })
        .ToListAsync();

    return Results.Ok(rows);
});

app.MapPost("/api/connections/{provider}/connect", [Authorize] async (string provider, ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    provider = provider.ToLowerInvariant().Trim();

    var row = await db.Connections.FirstOrDefaultAsync(c => c.UserId == uid.Value && c.ApiProvider == provider);
    if (row is null)
    {
        row = new ApiConnection {
            UserId = uid.Value,
            ApiProvider = provider,
            IsActive = true,
            LastSyncAt = null
        };
        db.Connections.Add(row);
    }
    else
    {
        row.IsActive = true;
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { ok = true });
});

app.MapPost("/api/connections/{provider}/disconnect", [Authorize] async (string provider, ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    provider = provider.ToLowerInvariant().Trim();

    var row = await db.Connections.FirstOrDefaultAsync(c => c.UserId == uid.Value && c.ApiProvider == provider);
    if (row is null) return Results.NotFound();

    row.IsActive = false;
    row.AccessToken = null;
    row.RefreshToken = null;
    row.TokenExpiresAt = null;
    await db.SaveChangesAsync();

    return Results.Ok(new { ok = true });
});



app.MapPost("/api/connections/{provider}/sync", [Authorize] async (string provider, ClaimsPrincipal user, AppDb db) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();
    provider = provider.ToLowerInvariant().Trim();

    var row = await db.Connections.FirstOrDefaultAsync(c => c.UserId == uid.Value && c.ApiProvider == provider);
    if (row is null || !row.IsActive) return Results.NotFound();

    if (provider == "strava")
    {

        var access = await EnsureStravaAccessTokenAsync(row, cfg, db);
        using var hc = new HttpClient();
        hc.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);


        var after = row.LastSyncAt ?? DateTime.UtcNow.AddMonths(-6);
        var afterUnix = new DateTimeOffset(after).ToUnixTimeSeconds();

        var page = 1;
        var total = 0;
        while (true)
        {
            var url = $"https://www.strava.com/api/v3/athlete/activities?after={afterUnix}&per_page=50&page={page}";
            var resp = await hc.GetAsync(url);
            if (!resp.IsSuccessStatusCode) break;

            var arr = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement.EnumerateArray().ToArray();
            if (arr.Length == 0) break;

            foreach (var a in arr)
            {
                var id = a.GetProperty("id").GetInt64();
                var name = a.GetProperty("name").GetString()!;
                var sport = a.TryGetProperty("sport_type", out var st) ? st.GetString() : "Workout";
                var distance = a.TryGetProperty("distance", out var d) ? d.GetDouble() : 0.0;
                var start = DateTime.Parse(a.GetProperty("start_date").GetString()!, null, System.Globalization.DateTimeStyles.AdjustToUniversal);

                var detailResp = await hc.GetAsync($"https://www.strava.com/api/v3/activities/{id}");
                string? poly = null;
                if (detailResp.IsSuccessStatusCode)
                {
                    var det = JsonDocument.Parse(await detailResp.Content.ReadAsStringAsync()).RootElement;
                    if (det.TryGetProperty("map", out var map) && map.TryGetProperty("summary_polyline", out var sp))
                        poly = sp.GetString();
                }

                var existing = await db.Entries.FirstOrDefaultAsync(e =>
                    e.UserId == uid.Value && e.SourceApi == "strava" && e.ExternalId == id.ToString());

                if (existing is null)
                {
                    existing = new TimelineEntry {
                        UserId = uid.Value,
                        Title = name,
                        Description = $"{sport} • {(distance/1000.0):0.##} km",
                        EntryType = "Activity",
                        Category = "Fitness",
                        SourceApi = "strava",
                        ExternalId = id.ToString(),
                        ExternalUrl = $"https://www.strava.com/activities/{id}",
                        ImageUrl = "",
                        Metadata = JsonSerializer.Serialize(new {
                            sport, distance, polyline = poly
                        }),
                        EventDate = start,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    db.Entries.Add(existing);
                }
                else
                {
                    existing.Title = name;
                    existing.Description = $"{sport} • {(distance/1000.0):0.##} km";
                    existing.EventDate = start;
                    existing.Metadata = JsonSerializer.Serialize(new { sport, distance, polyline = poly });
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                total++;
            }
            page++;
        }

        row.LastSyncAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true, provider = "strava", synced = total, lastSyncAt = row.LastSyncAt });
    }


    if (provider == "spotify")
    {
        var access = await EnsureSpotifyAccessTokenAsync(row, cfg, db);
        using var hc = new HttpClient();
        hc.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);


        var after = row.LastSyncAt ?? DateTime.UtcNow.AddMonths(-3);
        var afterMs = new DateTimeOffset(after).ToUnixTimeMilliseconds();

        var url = $"https://api.spotify.com/v1/me/player/recently-played?limit=50&after={afterMs}";
        var resp = await hc.GetAsync(url);
        if (!resp.IsSuccessStatusCode)
            return Results.StatusCode((int)resp.StatusCode);

        var root = JsonDocument.Parse(await resp.Content.ReadAsStringAsync()).RootElement;
        var items = root.GetProperty("items").EnumerateArray().ToArray();

        var count = 0;
        foreach (var i in items)
        {
            var playedAt = DateTime.Parse(i.GetProperty("played_at").GetString()!, null, System.Globalization.DateTimeStyles.AdjustToUniversal);
            var track = i.GetProperty("track");
            var trackId = track.GetProperty("id").GetString() ?? "";
            var name = track.GetProperty("name").GetString() ?? "Track";
            var artists = string.Join(", ", track.GetProperty("artists").EnumerateArray().Select(a => a.GetProperty("name").GetString()));
            var album = track.GetProperty("album").GetProperty("name").GetString() ?? "";
            var images = track.GetProperty("album").GetProperty("images").EnumerateArray().ToArray();
            var img = images.Length > 0 ? images[0].GetProperty("url").GetString() : "";
            var extUrl = track.GetProperty("external_urls").GetProperty("spotify").GetString() ?? "";
            var preview = track.TryGetProperty("preview_url", out var pv) ? pv.GetString() : null;
            var durationMs = track.GetProperty("duration_ms").GetInt32();

            var existing = await db.Entries.FirstOrDefaultAsync(e =>
                e.UserId == uid.Value && e.SourceApi == "spotify" && e.ExternalId == trackId && e.EventDate == playedAt);

            if (existing is null)
            {
                var e = new TimelineEntry {
                    UserId = uid.Value,
                    Title = $"{name} — {artists}",
                    Description = $"{album} • {TimeSpan.FromMilliseconds(durationMs):m\\:ss}",
                    EntryType = "Note",
                    Category = "Music",
                    SourceApi = "spotify",
                    ExternalId = trackId,
                    ExternalUrl = extUrl,
                    ImageUrl = img ?? "",
                    Metadata = JsonSerializer.Serialize(new { trackId, name, artists, album, previewUrl = preview }),
                    EventDate = playedAt,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Entries.Add(e);
            }
            else
            {
                existing.UpdatedAt = DateTime.UtcNow;
            }
            count++;
        }

        row.LastSyncAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true, provider = "spotify", synced = count, lastSyncAt = row.LastSyncAt });
    }

    if (provider == "github")
    {
        var access = await EnsureGitHubAccessTokenAsync(row);
        using var hc = new HttpClient();
        hc.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);
        hc.DefaultRequestHeaders.UserAgent.ParseAdd("PersonalTimeline/1.0");
        hc.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");


        var meResp = await hc.GetAsync("https://api.github.com/user");
        meResp.EnsureSuccessStatusCode();
        var meJson = JsonDocument.Parse(await meResp.Content.ReadAsStringAsync()).RootElement;
        var login = meJson.GetProperty("login").GetString()!;

        var afterUtc = row.LastSyncAt ?? DateTime.UtcNow.AddMonths(-3);
        var count = 0;


        var eventsResp = await hc.GetAsync($"https://api.github.com/users/{login}/events?per_page=100");
        eventsResp.EnsureSuccessStatusCode();
        var eventsRoot = JsonDocument.Parse(await eventsResp.Content.ReadAsStringAsync()).RootElement;

        foreach (var ev in eventsRoot.EnumerateArray())
        {

            if (!ev.TryGetProperty("type", out var typeEl) ||
                !ev.TryGetProperty("created_at", out var createdEl) ||
                !ev.TryGetProperty("repo", out var repoEl))
                continue;

            var type = typeEl.GetString() ?? "";
            if (!DateTime.TryParse(createdEl.GetString(), null,
                    System.Globalization.DateTimeStyles.AdjustToUniversal, out var createdAt))
                continue;

            if (createdAt < afterUtc) continue;

            var repoName = repoEl.TryGetProperty("name", out var rn) ? (rn.GetString() ?? "") : "";
            if (string.IsNullOrEmpty(repoName)) continue;

            string title = "", desc = "", url = "", externalId = "";

            try
            {
                switch (type)
                {
                    case "PushEvent":
                    {
                        if (!ev.TryGetProperty("payload", out var payload)) break;
                        var commitsArr = payload.TryGetProperty("commits", out var ca)
                            ? ca.EnumerateArray().ToArray() : Array.Empty<JsonElement>();

                        var msg = commitsArr.Length > 0 && commitsArr[0].TryGetProperty("message", out var m)
                            ? (m.GetString() ?? "Commit") : "Commit(s)";
                        var sha = commitsArr.Length > 0 && commitsArr[0].TryGetProperty("sha", out var s)
                            ? (s.GetString() ?? "") : "";

                        title = $"Pushed to {repoName}";
                        desc  = msg;
                        url   = !string.IsNullOrEmpty(sha) ? $"https://github.com/{repoName}/commit/{sha}"
                                                        : $"https://github.com/{repoName}";
                        externalId = string.IsNullOrEmpty(sha) ? $"push:{repoName}:{createdAt:O}" : $"push:{sha}";
                        break;
                    }

                    case "PullRequestEvent":
                    {
                        if (!ev.TryGetProperty("payload", out var payload)) break;
                        if (!payload.TryGetProperty("pull_request", out var pr)) break;

                        var prTitle = pr.TryGetProperty("title", out var t) ? (t.GetString() ?? "Pull request") : "Pull request";
                        var prUrl   = pr.TryGetProperty("html_url", out var u) ? (u.GetString() ?? "") : "";
                        var action  = payload.TryGetProperty("action", out var a) ? (a.GetString() ?? "updated") : "updated";
                        var prNum   = pr.TryGetProperty("number", out var n) ? n.GetInt32() : 0;

                        title = $"PR {action}: {repoName}#{prNum}";
                        desc  = prTitle;
                        url   = string.IsNullOrEmpty(prUrl) ? $"https://github.com/{repoName}/pull/{prNum}" : prUrl;
                        externalId = $"pr:{repoName}:{prNum}:{createdAt:O}";
                        break;
                    }

                    case "IssuesEvent":
                    {
                        if (!ev.TryGetProperty("payload", out var payload)) break;
                        if (!payload.TryGetProperty("issue", out var iss)) break;

                        var issTitle = iss.TryGetProperty("title", out var t) ? (t.GetString() ?? "Issue") : "Issue";
                        var issUrl   = iss.TryGetProperty("html_url", out var u) ? (u.GetString() ?? "") : "";
                        var action   = payload.TryGetProperty("action", out var a) ? (a.GetString() ?? "updated") : "updated";
                        var issNum   = iss.TryGetProperty("number", out var n) ? n.GetInt32() : 0;

                        title = $"Issue {action}: {repoName}#{issNum}";
                        desc  = issTitle;
                        url   = string.IsNullOrEmpty(issUrl) ? $"https://github.com/{repoName}/issues/{issNum}" : issUrl;
                        externalId = $"issue:{repoName}:{issNum}:{createdAt:O}";
                        break;
                    }

                    default:

                        continue;
                }
            }
            catch
            {

                continue;
            }

            if (string.IsNullOrEmpty(externalId)) continue;

            var existing = await db.Entries.FirstOrDefaultAsync(e =>
                e.UserId == uid.Value && e.SourceApi == "github" && e.ExternalId == externalId);

            if (existing is null)
            {
                var e = new TimelineEntry
                {
                    UserId = uid.Value,
                    Title = title,
                    Description = desc,
                    EntryType = "Milestone",
                    Category = "Code",
                    SourceApi = "github",
                    ExternalId = externalId,
                    ExternalUrl = url,
                    ImageUrl = "",
                    Metadata = JsonSerializer.Serialize(new { type, repoName }),
                    EventDate = createdAt,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Entries.Add(e);
            }
            else
            {
                existing.Title = title;
                existing.Description = desc;
                existing.EventDate = createdAt;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            count++;
        }

        row.LastSyncAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true, provider = "github", synced = count, lastSyncAt = row.LastSyncAt });
    }




    row.LastSyncAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(new { ok = true, provider, lastSyncAt = row.LastSyncAt });
});


app.MapGet("/api/oauth/strava/connect", [Authorize] (HttpRequest req, ClaimsPrincipal user) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var state = Convert.ToBase64String(Guid.NewGuid().ToByteArray()); 
    oauthStates[state] = uid.Value;

    var url = BuildStravaAuthorizeUrl(req, cfg, state);
    return Results.Redirect(url); 
});


app.MapGet("/api/oauth/strava/callback", async (
    string code, string state, AppDb db) =>
{
    if (!oauthStates.TryRemove(state, out var userId))
        return Results.BadRequest("Invalid or expired state");

    var (access, refresh, expUtc, athleteId) = await ExchangeStravaTokenAsync(cfg, code);

    var row = await db.Connections.FirstOrDefaultAsync(c => c.UserId == userId && c.ApiProvider == "strava");
    if (row is null) {
        row = new ApiConnection { UserId = userId, ApiProvider = "strava" };
        db.Connections.Add(row);
    }
    row.IsActive = true;
    row.AccessToken = access;
    row.RefreshToken = refresh;
    row.TokenExpiresAt = expUtc;

    row.Settings = System.Text.Json.JsonSerializer.Serialize(new { athleteId });
    row.LastSyncAt = null;
    await db.SaveChangesAsync();

    var front = cfg["App:FrontendBase"] ?? "http://localhost:5173";
    return Results.Redirect($"{front}/settings?connected=strava");
});

app.MapPost("/api/oauth/strava/connect-url", [Authorize] (HttpRequest req, ClaimsPrincipal user) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var state = Convert.ToBase64String(Guid.NewGuid().ToByteArray());

    oauthStates[state] = uid.Value;

    var url = BuildStravaAuthorizeUrl(req, cfg, state);
    return Results.Ok(new { url });
});

app.MapGet("/_config/strava", () => new {
  hasSection = cfg.GetSection("Strava").Exists(),
  clientId   = cfg["Strava:ClientId"],
  clientSecret = string.IsNullOrEmpty(cfg["Strava:ClientSecret"]) ? "(empty)" : "(set)",
  redirectUri  = cfg["Strava:RedirectUri"]
});

//=====Spotify=====


app.MapPost("/api/oauth/spotify/connect-url", [Authorize] (HttpRequest req, ClaimsPrincipal user) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var state = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    oauthStates[state] = uid.Value;

    var url = BuildSpotifyAuthorizeUrl(req, cfg, state);
    return Results.Ok(new { url });
});



app.MapGet("/api/oauth/spotify/callback", async (string code, string state, AppDb db) =>
{
    if (!oauthStates.TryRemove(state, out var userId))
        return Results.BadRequest("Invalid or expired state");

    var (access, refresh, expUtc) = await ExchangeSpotifyTokenAsync(cfg, code);

    var row = await db.Connections.FirstOrDefaultAsync(c => c.UserId == userId && c.ApiProvider == "spotify");
    if (row is null) { row = new ApiConnection { UserId = userId, ApiProvider = "spotify" }; db.Connections.Add(row); }

    row.IsActive = true;
    row.AccessToken = access;
    row.RefreshToken = refresh;
    row.TokenExpiresAt = expUtc;
    row.Settings = "{}";
    row.LastSyncAt = null; 

    await db.SaveChangesAsync();

    var front = cfg["App:FrontendBase"] ?? "http://localhost:5173";
    return Results.Redirect($"{front}/settings?connected=spotify");
});

//======Github=====

app.MapPost("/api/oauth/github/connect-url", [Authorize] (HttpRequest req, ClaimsPrincipal user) =>
{
    var uid = GetUserIdInt(user);
    if (uid is null) return Results.Unauthorized();

    var state = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    oauthStates[state] = uid.Value;

    var url = BuildGitHubAuthorizeUrl(req, cfg, state);
    return Results.Ok(new { url });
});


app.MapGet("/api/oauth/github/callback", async (string code, string state, AppDb db) =>
{
    if (!oauthStates.TryRemove(state, out var userId))
        return Results.BadRequest("Invalid or expired state");

    var access = await ExchangeGitHubTokenAsync(cfg, code);

    var row = await db.Connections.FirstOrDefaultAsync(c => c.UserId == userId && c.ApiProvider == "github");
    if (row is null) { row = new ApiConnection { UserId = userId, ApiProvider = "github" }; db.Connections.Add(row); }

    row.IsActive = true;
    row.AccessToken = access;
    row.RefreshToken = null;
    row.TokenExpiresAt = null;      
    row.Settings = "{}";
    row.LastSyncAt = null;      

    await db.SaveChangesAsync();

    var front = cfg["App:FrontendBase"] ?? "http://localhost:5173";
    return Results.Redirect($"{front}/settings?connected=github");
});


app.UseStaticFiles();
app.MapControllers();
app.Run();


public record GoogleLoginRequest(string IdToken);
public record UpdateProfileReq(string? name, string? picture);

public record CreateEntryReqDto(
    string title,
    string? description,
    string? entryType,   
    string? category,
    string? sourceApi,
    DateTime eventDate,
    string? externalUrl,
    string? imageUrl,        
    string? externalId,      
    string? metadata,
    string? fileAttachment,  
    string? fileName,        
    string? fileType             
);

public record UpdateEntryReqDto(
    string? title,
    string? description,
    string? entryType,   
    string? category,
    string? sourceApi,
    DateTime? eventDate,
    string? externalUrl,
    string? imageUrl,        
    string? externalId,      
    string? metadata,
    string? fileAttachment,  
    string? fileName,        
    string? fileType             
);




// DTOs
public record UpsertConnectionReq(
    string provider,
    string? accessToken,
    string? refreshToken,
    DateTime? tokenExpiresAt,
    string? settings
);

