



// using System.ComponentModel.DataAnnotations;

// namespace TimelineApi.Data;

// public class ApiConnection
// {
//     public int Id { get; set; }

//     // Our internal numeric PK for users
//     [Required]
//     public int UserId { get; set; }

//     [Required, MaxLength(32)]
//     public string ApiProvider { get; set; } = default!; // "github", "spotify", "strava", "todoist"

//     public string? AccessToken { get; set; }
//     public string? RefreshToken { get; set; }
//     public DateTime? TokenExpiresAt { get; set; }
//     public DateTime? LastSyncAt { get; set; }
//     public bool IsActive { get; set; } = true;

//     // Optional JSON for provider-specific settings
//     public string? Settings { get; set; }

//     // Navigation
//     public User? User { get; set; }
// }


// backend/TimelineApi/Data/ApiConnection.cs
using System.ComponentModel.DataAnnotations;

namespace TimelineApi.Data;

public class ApiConnection
{
    public int Id { get; set; }

    [Required] public int UserId { get; set; }

    [Required, MaxLength(32)]
    public string ApiProvider { get; set; } = default!; 
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiresAt { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Settings { get; set; } 

    public User? User { get; set; }
}
