using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.DTOs;
using NECMS.API.Services;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _context;

    public AuthController(AuthService authService, AppDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Invalid credentials" });
        return Ok(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var success = await _authService.ChangePasswordAsync(userId, dto);
        if (!success)
            return BadRequest(new { message = "Current password is incorrect" });
        return Ok(new { message = "Password changed successfully" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Student)
            .Include(u => u.Parent)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        return Ok(new
        {
            user.Id,
            user.Username,
            user.FullName,
            Role = user.Role.RoleName,
            user.Phone,
            user.Email,
            user.StudentId,
            user.ParentId,
            user.IsActive
        });
    }
}
