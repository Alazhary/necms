using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NECMS.API.Data;
using NECMS.API.DTOs;
using NECMS.API.Models;

namespace NECMS.API.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == dto.Username && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        var token = GenerateJwtToken(user);
        var student = user.StudentId.HasValue ? _context.Students.Find(user.StudentId.Value) : null;

        return new LoginResponseDto
        {
            Token = token,
            FullName = user.FullName,
            Role = user.Role.RoleName,
            UserId = user.Id,
            StudentId = user.StudentId,
            ParentId = user.ParentId
        };
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "NECMS_SuperSecretKey_2026_MustBeLongEnough!@#$%^&*()"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.RoleName),
            new Claim("FullName", user.FullName),
            new Claim("StudentId", user.StudentId?.ToString() ?? ""),
            new Claim("ParentId", user.ParentId?.ToString() ?? "")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "NECMS",
            audience: _configuration["Jwt:Audience"] ?? "NECMS",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
