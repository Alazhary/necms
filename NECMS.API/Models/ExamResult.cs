namespace NECMS.API.Models;

public class ExamResult
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public int ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public decimal Marks { get; set; }

    public int TeacherId { get; set; }
    public Teacher Teacher { get; set; } = null!;

    public DateTime EntryDate { get; set; } = DateTime.UtcNow;
}
