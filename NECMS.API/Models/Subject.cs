using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Subject
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string SubjectName { get; set; } = string.Empty;

    public int? GradeId { get; set; }
    public Grade? Grade { get; set; }

    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
