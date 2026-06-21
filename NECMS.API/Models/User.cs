using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public int? StudentId { get; set; }
    public Student? Student { get; set; }

    public int? ParentId { get; set; }
    public Parent? Parent { get; set; }
}
