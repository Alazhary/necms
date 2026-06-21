using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/grades")]
[Authorize(Roles = "Owner,Supervisor")]
public class GradesController : ControllerBase
{
    private readonly AppDbContext _context;

    public GradesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var grades = await _context.Grades
            .OrderBy(g => g.Id)
            .ToListAsync();
        return Ok(grades);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var grade = await _context.Grades.FindAsync(id);
        if (grade == null)
            return NotFound();
        return Ok(grade);
    }
}
