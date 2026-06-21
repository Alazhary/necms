using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Revenue
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string RevenueType { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public int? StudentId { get; set; }
    public Student? Student { get; set; }

    public string? Notes { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;
}
