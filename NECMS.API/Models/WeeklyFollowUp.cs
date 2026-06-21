namespace NECMS.API.Models;

public class WeeklyFollowUp
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public int WeekNumber { get; set; }

    public string? AcademicLevel { get; set; }

    public string? BehaviorLevel { get; set; }

    public string? Notes { get; set; }
}
