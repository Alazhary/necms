using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/portal")]
public class ParentPortalController : ControllerBase
{
    private readonly AppDbContext _context;

    public ParentPortalController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("student/{studentCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStudentData(string studentCode)
    {
        var student = await _context.Students
            .Include(s => s.Grade)
            .Include(s => s.Parent)
            .FirstOrDefaultAsync(s => s.StudentCode == studentCode);

        if (student == null)
            return NotFound(new { message = "Student not found" });

        var attendances = await _context.Attendances
            .Where(a => a.StudentId == student.Id)
            .OrderByDescending(a => a.Date)
            .Take(30)
            .ToListAsync();

        var examResults = await _context.ExamResults
            .Include(er => er.Exam)
            .ThenInclude(e => e.Subject)
            .Where(er => er.StudentId == student.Id)
            .OrderByDescending(er => er.Exam.ExamDate)
            .ToListAsync();

        var dailyFollowUps = await _context.DailyFollowUps
            .Where(f => f.StudentId == student.Id)
            .OrderByDescending(f => f.FollowUpDate)
            .Take(10)
            .ToListAsync();

        var weeklyFollowUps = await _context.WeeklyFollowUps
            .Where(f => f.StudentId == student.Id)
            .OrderByDescending(f => f.WeekNumber)
            .Take(10)
            .ToListAsync();

        var monthlyFollowUps = await _context.MonthlyFollowUps
            .Where(f => f.StudentId == student.Id)
            .OrderByDescending(f => f.Month)
            .Take(10)
            .ToListAsync();

        var notifications = await _context.Notifications
            .Where(n => n.StudentId == student.Id)
            .OrderByDescending(n => n.SentDate)
            .Take(20)
            .ToListAsync();

        return Ok(new
        {
            Student = new
            {
                student.Id,
                student.StudentCode,
                student.FullName,
                student.BirthDate,
                student.Gender,
                student.SchoolName,
                Grade = student.Grade?.GradeName,
                student.Phone,
                student.WhatsApp,
                Parent = student.Parent != null ? new
                {
                    student.Parent.FullName,
                    student.Parent.Mobile,
                    student.Parent.WhatsApp
                } : null
            },
            Attendance = attendances,
            ExamResults = examResults.Select(er => new
            {
                ExamName = er.Exam.ExamName,
                SubjectName = er.Exam.Subject.SubjectName,
                er.Marks,
                er.Exam.TotalMarks,
                er.Exam.ExamDate
            }),
            DailyFollowUps = dailyFollowUps,
            WeeklyFollowUps = weeklyFollowUps,
            MonthlyFollowUps = monthlyFollowUps,
            Notifications = notifications
        });
    }
}
