using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.DTOs;
using NECMS.API.Models;
using NECMS.API.Services;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _auditService;

    public AttendanceController(AppDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Create([FromBody] CreateAttendanceDto dto)
    {
        var existing = await _context.Attendances
            .FirstOrDefaultAsync(a => a.StudentId == dto.StudentId && a.Date.Date == dto.Date.Date);

        if (existing != null)
        {
            existing.Status = dto.Status;
            existing.Notes = dto.Notes;
        }
        else
        {
            var attendance = new Attendance
            {
                StudentId = dto.StudentId,
                Date = dto.Date,
                Status = dto.Status,
                Notes = dto.Notes
            };
            _context.Attendances.Add(attendance);
        }

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Create", "Attendance", dto.StudentId, null, dto.Status);

        return Ok(new { message = "Attendance recorded" });
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> BulkCreate([FromBody] BulkAttendanceDto dto)
    {
        foreach (var item in dto.Attendances)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.StudentId == item.StudentId && a.Date.Date == dto.Date.Date);

            if (existing != null)
            {
                existing.Status = item.Status;
                existing.Notes = item.Notes;
            }
            else
            {
                _context.Attendances.Add(new Attendance
                {
                    StudentId = item.StudentId,
                    Date = dto.Date,
                    Status = item.Status,
                    Notes = item.Notes
                });
            }
        }

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "BulkCreate", "Attendance", null, null, $"{dto.Attendances.Count} records");

        return Ok(new { message = "Bulk attendance recorded" });
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

        var records = await _context.Attendances
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
        return Ok(records);
    }

    [HttpGet("date/{date}")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> GetByDate(DateTime date)
    {
        var records = await _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.Date.Date == date.Date)
            .OrderBy(a => a.Student.FullName)
            .ToListAsync();
        return Ok(records);
    }

    [HttpGet("grade/{gradeId}/{date}")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> GetByGrade(int gradeId, DateTime date)
    {
        var records = await _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.Student.GradeId == gradeId && a.Date.Date == date.Date)
            .OrderBy(a => a.Student.FullName)
            .ToListAsync();
        return Ok(records);
    }
}
