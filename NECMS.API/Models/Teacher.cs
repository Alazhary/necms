using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Teacher
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? WhatsApp { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(50)]
    public string? SalaryType { get; set; }

    public decimal SalaryAmount { get; set; }

    public string? Notes { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public ICollection<ExamResult> ExamResults { get; set; } = new List<ExamResult>();
    public ICollection<TeacherPayroll> TeacherPayrolls { get; set; } = new List<TeacherPayroll>();
}
