using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.Models;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/subjects")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Owner,Supervisor,Teacher")]
    public async Task<IActionResult> GetAll()
    {
        var subjects = await _context.Subjects
            .Include(s => s.Grade)
            .OrderBy(s => s.GradeId)
            .ThenBy(s => s.SubjectName)
            .ToListAsync();
        return Ok(subjects);
    }

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Create([FromBody] Subject dto)
    {
        var subject = new Subject
        {
            SubjectName = dto.SubjectName,
            GradeId = dto.GradeId
        };
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = subject.Id }, subject);
    }

    [HttpGet("grade/{gradeId}")]
    [Authorize(Roles = "Owner,Supervisor,Teacher")]
    public async Task<IActionResult> GetByGrade(int gradeId)
    {
        var subjects = await _context.Subjects
            .Where(s => s.GradeId == gradeId)
            .OrderBy(s => s.SubjectName)
            .ToListAsync();
        return Ok(subjects);
    }
}
