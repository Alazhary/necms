using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Attendance
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateTime Date { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}
