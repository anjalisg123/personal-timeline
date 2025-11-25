using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TimelineApi.Data;

public class TimelineEntry
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime EventDate { get; set; }
    public string EntryType { get; set; } 
    public string Category { get; set; }
    public string ImageUrl { get; set; }
    public string ExternalUrl { get; set; }
    public string SourceApi { get; set; } 
    public string ExternalId { get; set; } 
    public string Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // NEW FILE ATTACHMENT FIELDS
    public string FileAttachment { get; set; } = string.Empty;   // base64 data or URL
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;         // e.g. "image/png", "application/pdf"
    

    public User User { get; set; }
}