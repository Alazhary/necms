using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.Models;
using NECMS.API.Services;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/supervisors")]
[Authorize(Roles = "Owner")]
public class SupervisorsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _auditService;

    public SupervisorsController(AppDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var supervisors = await _context.Supervisors
            .Select(s => new
            {
                s.Id,
                s.FullName,
                s.Phone,
                s.Address,
                s.Salary,
                s.Notes,
                HasUser = s.UserId != null
            })
            .ToListAsync();
        return Ok(supervisors);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var supervisor = await _context.Supervisors
            .Where(s => s.Id == id)
            .Select(s => new
            {
                s.Id,
                s.FullName,
                s.Phone,
                s.Address,
                s.Salary,
                s.Notes,
                s.UserId
            })
            .FirstOrDefaultAsync();

        if (supervisor == null)
            return NotFound();
        return Ok(supervisor);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Supervisor dto)
    {
        var username = $"supervisor_{DateTime.UtcNow.Ticks}";

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(username),
                FullName = dto.FullName,
                RoleId = 2,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var supervisor = new Supervisor
            {
                FullName = dto.FullName,
                Phone = dto.Phone,
                Address = dto.Address,
                Salary = dto.Salary,
                Notes = dto.Notes,
                UserId = user.Id
            };
            _context.Supervisors.Add(supervisor);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _auditService.LogAsync(userId, "Create", "Supervisor", supervisor.Id, null, supervisor.FullName);

            return CreatedAtAction(nameof(GetById), new { id = supervisor.Id }, new
            {
                supervisor.Id,
                supervisor.FullName,
                supervisor.Phone,
                supervisor.Address,
                supervisor.Salary,
                supervisor.Notes
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Supervisor dto)
    {
        var supervisor = await _context.Supervisors.FindAsync(id);
        if (supervisor == null)
            return NotFound();

        var oldValues = supervisor.FullName;

        supervisor.FullName = dto.FullName;
        supervisor.Phone = dto.Phone;
        supervisor.Address = dto.Address;
        supervisor.Salary = dto.Salary;
        supervisor.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Update", "Supervisor", supervisor.Id, oldValues, supervisor.FullName);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var supervisor = await _context.Supervisors
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supervisor == null)
            return NotFound();

        if (supervisor.User != null)
        {
            supervisor.User.IsActive = false;
        }

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Delete", "Supervisor", supervisor.Id, supervisor.FullName, "Deleted");

        _context.Supervisors.Remove(supervisor);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
