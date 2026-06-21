using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.DTOs;
using NECMS.API.Models;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/followups")]
public class FollowUpsController : ControllerBase
{
    private readonly AppDbContext _context;

    public FollowUpsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("daily")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> CreateDaily([FromBody] CreateDailyFollowUpDto dto)
    {
        var followUp = new DailyFollowUp
        {
            StudentId = dto.StudentId,
            FollowUpDate = dto.FollowUpDate,
            Homework = dto.Homework,
            Participation = dto.Participation,
            Behavior = dto.Behavior,
            Notes = dto.Notes
        };
        _context.DailyFollowUps.Add(followUp);
        await _context.SaveChangesAsync();
        return Ok(followUp);
    }

    [HttpPost("weekly")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> CreateWeekly([FromBody] CreateWeeklyFollowUpDto dto)
    {
        var followUp = new WeeklyFollowUp
        {
            StudentId = dto.StudentId,
            WeekNumber = dto.WeekNumber,
            AcademicLevel = dto.AcademicLevel,
            BehaviorLevel = dto.BehaviorLevel,
            Notes = dto.Notes
        };
        _context.WeeklyFollowUps.Add(followUp);
        await _context.SaveChangesAsync();
        return Ok(followUp);
    }

    [HttpPost("monthly")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> CreateMonthly([FromBody] CreateMonthlyFollowUpDto dto)
    {
        var followUp = new MonthlyFollowUp
        {
            StudentId = dto.StudentId,
            Month = dto.Month,
            AcademicEvaluation = dto.AcademicEvaluation,
            EthicalEvaluation = dto.EthicalEvaluation,
            SocialEvaluation = dto.SocialEvaluation,
            Notes = dto.Notes
        };
        _context.MonthlyFollowUps.Add(followUp);
        await _context.SaveChangesAsync();
        return Ok(followUp);
    }

    [HttpGet("daily/student/{studentId}")]
    [Authorize]
    public async Task<IActionResult> GetDailyByStudent(int studentId)
    {
        var accessResult = CheckStudentAccess(studentId);
        if (accessResult != null) return accessResult;

        var records = await _context.DailyFollowUps
            .Where(f => f.StudentId == studentId)
            .OrderByDescending(f => f.FollowUpDate)
            .ToListAsync();
        return Ok(records);
    }

    [HttpGet("weekly/student/{studentId}")]
    [Authorize]
    public async Task<IActionResult> GetWeeklyByStudent(int studentId)
    {
        var accessResult = CheckStudentAccess(studentId);
        if (accessResult != null) return accessResult;

        var records = await _context.WeeklyFollowUps
            .Where(f => f.StudentId == studentId)
            .OrderByDescending(f => f.WeekNumber)
            .ToListAsync();
        return Ok(records);
    }

    [HttpGet("monthly/student/{studentId}")]
    [Authorize]
    public async Task<IActionResult> GetMonthlyByStudent(int studentId)
    {
        var accessResult = CheckStudentAccess(studentId);
        if (accessResult != null) return accessResult;

        var records = await _context.MonthlyFollowUps
            .Where(f => f.StudentId == studentId)
            .OrderByDescending(f => f.Month)
            .ToListAsync();
        return Ok(records);
    }

    private IActionResult? CheckStudentAccess(int studentId)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var userStudentId = User.FindFirstValue("StudentId");
        var userParentId = User.FindFirstValue("ParentId");

        if (userRole == "Parent")
        {
            var hasAccess = _context.Students
                .Any(s => s.Id == studentId && s.ParentId.ToString() == userParentId);
            if (!hasAccess) return Forbid();
        }
        else if (userRole == "Student")
        {
            if (userStudentId != studentId.ToString()) return Forbid();
        }
        else if (userRole != "Owner" && userRole != "Supervisor")
        {
            return Forbid();
        }

        return null;
    }
}
