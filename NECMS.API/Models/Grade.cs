using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Grade
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string GradeName { get; set; } = string.Empty;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
