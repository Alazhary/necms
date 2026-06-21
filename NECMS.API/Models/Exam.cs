using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Exam
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string ExamName { get; set; } = string.Empty;

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public int? GradeId { get; set; }
    public Grade? Grade { get; set; }

    [MaxLength(50)]
    public string? ExamType { get; set; }

    public decimal TotalMarks { get; set; }

    public DateTime ExamDate { get; set; }

    public ICollection<ExamResult> ExamResults { get; set; } = new List<ExamResult>();
}
