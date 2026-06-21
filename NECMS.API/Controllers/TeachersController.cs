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
[Route("api/teachers")]
[Authorize(Roles = "Owner")]
public class TeachersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _auditService;

    public TeachersController(AppDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teachers = await _context.Teachers
            .Include(t => t.TeacherSubjects)
            .ThenInclude(ts => ts.Subject)
            .Select(t => new TeacherDto
            {
                Id = t.Id,
                FullName = t.FullName,
                Phone = t.Phone,
                WhatsApp = t.WhatsApp,
                Address = t.Address,
                SalaryType = t.SalaryType,
                SalaryAmount = t.SalaryAmount,
                Notes = t.Notes,
                Subjects = t.TeacherSubjects.Select(ts => ts.Subject.SubjectName).ToList()
            })
            .ToListAsync();
        return Ok(teachers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var teacher = await _context.Teachers
            .Include(t => t.TeacherSubjects)
            .ThenInclude(ts => ts.Subject)
            .Where(t => t.Id == id)
            .Select(t => new TeacherDto
            {
                Id = t.Id,
                FullName = t.FullName,
                Phone = t.Phone,
                WhatsApp = t.WhatsApp,
                Address = t.Address,
                SalaryType = t.SalaryType,
                SalaryAmount = t.SalaryAmount,
                Notes = t.Notes,
                Subjects = t.TeacherSubjects.Select(ts => ts.Subject.SubjectName).ToList()
            })
            .FirstOrDefaultAsync();

        if (teacher == null)
            return NotFound();
        return Ok(teacher);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeacherDto dto)
    {
        var username = $"teacher_{DateTime.UtcNow.Ticks}";

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(username),
                FullName = dto.FullName,
                RoleId = 3,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var teacher = new Teacher
            {
                FullName = dto.FullName,
                Phone = dto.Phone,
                WhatsApp = dto.WhatsApp,
                Address = dto.Address,
                SalaryType = dto.SalaryType,
                SalaryAmount = dto.SalaryAmount,
                Notes = dto.Notes,
                UserId = user.Id
            };
            _context.Teachers.Add(teacher);
            await _context.SaveChangesAsync();

            if (dto.SubjectIds.Any())
            {
                foreach (var subjectId in dto.SubjectIds)
                {
                    _context.TeacherSubjects.Add(new TeacherSubject
                    {
                        TeacherId = teacher.Id,
                        SubjectId = subjectId
                    });
                }
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _auditService.LogAsync(userId, "Create", "Teacher", teacher.Id, null, teacher.FullName);

            return CreatedAtAction(nameof(GetById), new { id = teacher.Id }, new TeacherDto
            {
                Id = teacher.Id,
                FullName = teacher.FullName,
                Phone = teacher.Phone,
                WhatsApp = teacher.WhatsApp,
                Address = teacher.Address,
                SalaryType = teacher.SalaryType,
                SalaryAmount = teacher.SalaryAmount,
                Notes = teacher.Notes,
                Subjects = dto.SubjectIds.Select(sid => "").ToList()
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateTeacherDto dto)
    {
        var teacher = await _context.Teachers
            .Include(t => t.TeacherSubjects)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (teacher == null)
            return NotFound();

        var oldValues = teacher.FullName;

        teacher.FullName = dto.FullName;
        teacher.Phone = dto.Phone;
        teacher.WhatsApp = dto.WhatsApp;
        teacher.Address = dto.Address;
        teacher.SalaryType = dto.SalaryType;
        teacher.SalaryAmount = dto.SalaryAmount;
        teacher.Notes = dto.Notes;

        _context.TeacherSubjects.RemoveRange(teacher.TeacherSubjects);

        foreach (var subjectId in dto.SubjectIds)
        {
            _context.TeacherSubjects.Add(new TeacherSubject
            {
                TeacherId = teacher.Id,
                SubjectId = subjectId
            });
        }

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Update", "Teacher", teacher.Id, oldValues, teacher.FullName);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var teacher = await _context.Teachers
            .Include(t => t.User)
            .Include(t => t.TeacherSubjects)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (teacher == null)
            return NotFound();

        _context.TeacherSubjects.RemoveRange(teacher.TeacherSubjects);

        if (teacher.User != null)
        {
            teacher.User.IsActive = false;
        }

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Delete", "Teacher", teacher.Id, teacher.FullName, "Deleted");

        _context.Teachers.Remove(teacher);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
