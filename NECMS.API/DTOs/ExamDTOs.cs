namespace NECMS.API.DTOs;

public class CreateExamDto
{
    public string ExamName { get; set; } = string.Empty;
    public int SubjectId { get; set; }
    public int? GradeId { get; set; }
    public string? ExamType { get; set; }
    public decimal TotalMarks { get; set; }
    public DateTime ExamDate { get; set; }
}

public class EnterGradeDto
{
    public int ExamId { get; set; }
    public List<StudentGradeDto> Grades { get; set; } = new();
}

public class StudentGradeDto
{
    public int StudentId { get; set; }
    public decimal Marks { get; set; }
}
