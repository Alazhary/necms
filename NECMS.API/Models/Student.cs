using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Student
{
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string StudentCode { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    public DateTime? BirthDate { get; set; }

    [MaxLength(10)]
    public string? Gender { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? SchoolName { get; set; }

    public int? GradeId { get; set; }
    public Grade? Grade { get; set; }

    public int? ParentId { get; set; }
    public Parent? Parent { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? WhatsApp { get; set; }

    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

    [MaxLength(200)]
    public string? Photo { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Active";

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<ExamResult> ExamResults { get; set; } = new List<ExamResult>();
    public ICollection<DailyFollowUp> DailyFollowUps { get; set; } = new List<DailyFollowUp>();
    public ICollection<WeeklyFollowUp> WeeklyFollowUps { get; set; } = new List<WeeklyFollowUp>();
    public ICollection<MonthlyFollowUp> MonthlyFollowUps { get; set; } = new List<MonthlyFollowUp>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Revenue> Revenues { get; set; } = new List<Revenue>();
    public User? User { get; set; }
}
