
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
