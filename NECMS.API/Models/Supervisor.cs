using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Supervisor
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    public decimal Salary { get; set; }

    public string? Notes { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<SupervisorPayroll> SupervisorPayrolls { get; set; } = new List<SupervisorPayroll>();
}
