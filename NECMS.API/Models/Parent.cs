using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Parent
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Mobile { get; set; }

    [MaxLength(20)]
    public string? Mobile2 { get; set; }

    [MaxLength(20)]
    public string? WhatsApp { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    public string? Notes { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
