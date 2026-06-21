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
[Route("api/exams")]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _auditService;

    public ExamsController(AppDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet]
    [Authorize(Roles = "Owner,Supervisor,Teacher")]
    public async Task<IActionResult> GetAll()
    {
        var exams = await _context.Exams
            .Include(e => e.Subject)
            .Include(e => e.Grade)
            .OrderByDescending(e => e.ExamDate)
            .ToListAsync();
        return Ok(exams);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Owner,Supervisor,Teacher")]
    public async Task<IActionResult> GetById(int id)
    {
        var exam = await _context.Exams
            .Include(e => e.Subject)
            .Include(e => e.Grade)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null)
            return NotFound();
        return Ok(exam);
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Create([FromBody] CreateExamDto dto)
    {
        var exam = new Exam
        {
            ExamName = dto.ExamName,
            SubjectId = dto.SubjectId,
            GradeId = dto.GradeId,
            ExamType = dto.ExamType,
            TotalMarks = dto.TotalMarks,
            ExamDate = dto.ExamDate
        };

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Create", "Exam", exam.Id, null, exam.ExamName);

        return CreatedAtAction(nameof(GetById), new { id = exam.Id }, exam);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateExamDto dto)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null)
            return NotFound();

        var oldName = exam.ExamName;

        exam.ExamName = dto.ExamName;
        exam.SubjectId = dto.SubjectId;
        exam.GradeId = dto.GradeId;
        exam.ExamType = dto.ExamType;
        exam.TotalMarks = dto.TotalMarks;
        exam.ExamDate = dto.ExamDate;

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Update", "Exam", exam.Id, oldName, exam.ExamName);

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Delete(int id)
    {
        var exam = await _context.Exams
            .Include(e => e.ExamResults)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null)
            return NotFound();

        _context.ExamResults.RemoveRange(exam.ExamResults);

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Delete", "Exam", exam.Id, exam.ExamName, "Deleted");

        _context.Exams.Remove(exam);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("enter-grades")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> EnterGrades([FromBody] EnterGradeDto dto)
    {
        var exam = await _context.Exams.FindAsync(dto.ExamId);
        if (exam == null)
            return NotFound(new { message = "Exam not found" });

        var teacherId = await _context.Teachers
            .Where(t => t.UserId.ToString() == User.FindFirstValue(ClaimTypes.NameIdentifier))
            .Select(t => (int?)t.Id)
            .FirstOrDefaultAsync();

        if (teacherId == null)
            return Forbid();

        foreach (var grade in dto.Grades)
        {
            var existing = await _context.ExamResults
                .FirstOrDefaultAsync(er => er.ExamId == dto.ExamId && er.StudentId == grade.StudentId);

            if (existing != null)
            {
                existing.Marks = grade.Marks;
                existing.TeacherId = teacherId.Value;
                existing.EntryDate = DateTime.UtcNow;
            }
            else
            {
                _context.ExamResults.Add(new ExamResult
                {
                    StudentId = grade.StudentId,
                    ExamId = dto.ExamId,
                    Marks = grade.Marks,
                    TeacherId = teacherId.Value,
                    EntryDate = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Grades entered successfully" });
    }

    [HttpGet("{id}/results")]
    [Authorize(Roles = "Owner,Supervisor,Teacher")]
    public async Task<IActionResult> GetResults(int id)
    {
        var results = await _context.ExamResults
            .Include(er => er.Student)
            .Include(er => er.Teacher)
            .Where(er => er.ExamId == id)
            .OrderBy(er => er.Student.FullName)
            .ToListAsync();
        return Ok(results);
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

        var results = await _context.ExamResults
            .Include(er => er.Exam)
            .ThenInclude(e => e.Subject)
            .Where(er => er.StudentId == studentId)
            .OrderByDescending(er => er.Exam.ExamDate)
            .ToListAsync();
        return Ok(results);
    }
}
