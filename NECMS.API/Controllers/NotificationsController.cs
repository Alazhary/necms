using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.Models;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<IActionResult> GetByStudent(int studentId)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var userStudentId = User.FindFirstValue("StudentId");
        var userParentId = User.FindFirstValue("ParentId");

        if (userRole == "Parent")
        {
            var hasAccess = await _context.Students
                .AnyAsync(s => s.Id == studentId && s.ParentId.ToString() == userParentId);
            if (!hasAccess)
                return Forbid();
        }
        else if (userRole == "Student")
        {
            if (userStudentId != studentId.ToString())
                return Forbid();
        }
        else if (userRole != "Owner" && userRole != "Supervisor")
        {
            return Forbid();
        }

        var notifications = await _context.Notifications
            .Where(n => n.StudentId == studentId)
            .OrderByDescending(n => n.SentDate)
            .ToListAsync();
        return Ok(notifications);
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Create([FromBody] Notification dto)
    {
        var notification = new Notification
        {
            StudentId = dto.StudentId,
            ParentId = dto.ParentId,
            NotificationType = dto.NotificationType,
            Message = dto.Message,
            SentDate = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return Ok(notification);
    }
}
