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
[Route("api/students")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _auditService;

    public StudentsController(AppDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> GetAll()
    {
        var students = await _context.Students
            .Include(s => s.Grade)
            .Include(s => s.Parent)
            .Select(s => new StudentDto
            {
                Id = s.Id,
                StudentCode = s.StudentCode,
                FullName = s.FullName,
                BirthDate = s.BirthDate,
                Gender = s.Gender,
                Address = s.Address,
                SchoolName = s.SchoolName,
                GradeId = s.GradeId,
                GradeName = s.Grade != null ? s.Grade.GradeName : null,
                ParentId = s.ParentId,
                ParentName = s.Parent != null ? s.Parent.FullName : null,
                Phone = s.Phone,
                WhatsApp = s.WhatsApp,
                RegistrationDate = s.RegistrationDate,
                Status = s.Status
            })
            .ToListAsync();
        return Ok(students);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _context.Students
            .Include(s => s.Grade)
            .Include(s => s.Parent)
            .Where(s => s.Id == id)
            .Select(s => new StudentDto
            {
                Id = s.Id,
                StudentCode = s.StudentCode,
                FullName = s.FullName,
                BirthDate = s.BirthDate,
                Gender = s.Gender,
                Address = s.Address,
                SchoolName = s.SchoolName,
                GradeId = s.GradeId,
                GradeName = s.Grade != null ? s.Grade.GradeName : null,
                ParentId = s.ParentId,
                ParentName = s.Parent != null ? s.Parent.FullName : null,
                Phone = s.Phone,
                WhatsApp = s.WhatsApp,
                RegistrationDate = s.RegistrationDate,
                Status = s.Status
            })
            .FirstOrDefaultAsync();

        if (student == null)
            return NotFound();
        return Ok(student);
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Create([FromBody] CreateStudentDto dto)
    {
        var birthYear = dto.BirthDate?.Year ?? DateTime.UtcNow.Year;
        var gradeId = dto.GradeId ?? 1;

        var maxSeq = await _context.Students
            .Where(s => s.GradeId == gradeId)
            .CountAsync() + 1;

        var studentCode = $"{birthYear}{gradeId}{maxSeq:D4}";

        var student = new Student
        {
            StudentCode = studentCode,
            FullName = dto.FullName,
            BirthDate = dto.BirthDate,
            Gender = dto.Gender,
            Address = dto.Address,
            SchoolName = dto.SchoolName,
            GradeId = gradeId,
            Phone = dto.Phone,
            WhatsApp = dto.WhatsApp,
            RegistrationDate = DateTime.UtcNow,
            Status = "Active"
        };

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var parent = new Parent
            {
                FullName = dto.ParentFullName ?? dto.FullName + "'s Parent",
                Mobile = dto.ParentMobile,
                Mobile2 = dto.ParentMobile2,
                WhatsApp = dto.ParentWhatsApp,
                Address = dto.ParentAddress
            };
            _context.Parents.Add(parent);
            await _context.SaveChangesAsync();

            student.ParentId = parent.Id;

            var studentUser = new User
            {
                Username = studentCode,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(studentCode),
                FullName = dto.FullName,
                RoleId = 5,
                StudentId = student.Id,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            _context.Users.Add(studentUser);

            var parentUser = new User
            {
                Username = $"parent_{studentCode}",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(studentCode),
                FullName = parent.FullName,
                RoleId = 4,
                ParentId = parent.Id,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            _context.Users.Add(parentUser);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _auditService.LogAsync(userId, "Create", "Student", student.Id, null, studentCode);

            return CreatedAtAction(nameof(GetById), new { id = student.Id }, new StudentDto
            {
                Id = student.Id,
                StudentCode = student.StudentCode,
                FullName = student.FullName,
                BirthDate = student.BirthDate,
                Gender = student.Gender,
                Address = student.Address,
                SchoolName = student.SchoolName,
                GradeId = student.GradeId,
                Phone = student.Phone,
                WhatsApp = student.WhatsApp,
                RegistrationDate = student.RegistrationDate,
                Status = student.Status
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentDto dto)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
            return NotFound();

        var oldValues = $"{student.FullName}|{student.Status}";

        student.FullName = dto.FullName;
        student.BirthDate = dto.BirthDate;
        student.Gender = dto.Gender;
        student.Address = dto.Address;
        student.SchoolName = dto.SchoolName;
        student.GradeId = dto.GradeId;
        student.Phone = dto.Phone;
        student.WhatsApp = dto.WhatsApp;
        student.Status = dto.Status;

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var newValues = $"{student.FullName}|{student.Status}";
        await _auditService.LogAsync(userId, "Update", "Student", student.Id, oldValues, newValues);

        return NoContent();
    }

    [HttpPost("{id}/promote")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> Promote(int id, [FromBody] PromoteStudentDto dto)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student == null)
            return NotFound();

        var oldCode = student.StudentCode;
        var birthYear = student.BirthDate?.Year ?? DateTime.UtcNow.Year;

        var maxSeq = await _context.Students
            .Where(s => s.GradeId == dto.NewGradeId)
            .CountAsync() + 1;

        student.GradeId = dto.NewGradeId;
        student.StudentCode = $"{birthYear}{dto.NewGradeId}{maxSeq:D4}";

        if (student.User != null)
        {
            student.User.IsActive = false;
        }

        var newUser = new User
        {
            Username = student.StudentCode,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(student.StudentCode),
            FullName = student.FullName,
            RoleId = 5,
            StudentId = student.Id,
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        };
        _context.Users.Add(newUser);

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Promote", "Student", student.Id, oldCode, student.StudentCode);

        return Ok(new { message = "Student promoted successfully", newCode = student.StudentCode });
    }

    [HttpGet("code/{code}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByCode(string code)
    {
        var student = await _context.Students
            .Include(s => s.Grade)
            .Include(s => s.Parent)
            .Where(s => s.StudentCode == code)
            .Select(s => new StudentDto
            {
                Id = s.Id,
                StudentCode = s.StudentCode,
                FullName = s.FullName,
                BirthDate = s.BirthDate,
                Gender = s.Gender,
                GradeId = s.GradeId,
                GradeName = s.Grade != null ? s.Grade.GradeName : null,
                ParentName = s.Parent != null ? s.Parent.FullName : null,
                Phone = s.Phone,
                Status = s.Status
            })
            .FirstOrDefaultAsync();

        if (student == null)
            return NotFound();
        return Ok(student);
    }

    [HttpGet("grade/{gradeId}")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> GetByGrade(int gradeId)
    {
        var students = await _context.Students
            .Where(s => s.GradeId == gradeId)
            .Include(s => s.Grade)
            .Include(s => s.Parent)
            .Select(s => new StudentDto
            {
                Id = s.Id,
                StudentCode = s.StudentCode,
                FullName = s.FullName,
                BirthDate = s.BirthDate,
                Gender = s.Gender,
                GradeId = s.GradeId,
                GradeName = s.Grade != null ? s.Grade.GradeName : null,
                ParentName = s.Parent != null ? s.Parent.FullName : null,
                Phone = s.Phone,
                Status = s.Status
            })
            .ToListAsync();
        return Ok(students);
    }
}
