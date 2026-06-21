using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class TeacherPayroll
{
    public int Id { get; set; }

    public int TeacherId { get; set; }
    public Teacher Teacher { get; set; } = null!;

    [MaxLength(20)]
    public string Month { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public decimal Bonus { get; set; }

    public decimal Deduction { get; set; }

    public decimal NetSalary { get; set; }
}
