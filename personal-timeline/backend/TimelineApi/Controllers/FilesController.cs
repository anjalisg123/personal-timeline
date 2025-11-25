using Microsoft.AspNetCore.Mvc;

namespace TimelineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public FilesController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet("{filename}")]
    public IActionResult GetFile(string filename)
    {
        // Prevent directory traversal attacks
        if (filename.Contains("..") || filename.Contains("/") || filename.Contains("\\"))
            return BadRequest("Invalid filename");

        var filePath = Path.Combine(_env.ContentRootPath, "uploads", filename);

        if (!System.IO.File.Exists(filePath))
            return NotFound();

        var extension = Path.GetExtension(filename).ToLowerInvariant();
        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };

        return PhysicalFile(filePath, contentType);
    }
}