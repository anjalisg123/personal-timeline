using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace TimelineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<UploadController> _logger;

    public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
    {
        _env = env;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });


        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "File too large. Maximum size is 10MB" });


        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", 
                                   "application/pdf", "application/msword",
                                   "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
        
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { error = "Invalid file type" });


        var uploadsPath = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);


        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsPath, uniqueFileName);


        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new
        {
            filePath = $"/api/files/{uniqueFileName}",
            fileName = file.FileName,
            fileType = file.ContentType
        });
    }
}