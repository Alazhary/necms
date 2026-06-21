namespace NECMS.API.Models;

public class DailyFollowUp
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateTime FollowUpDate { get; set; }

    public string? Homework { get; set; }

    public string? Participation { get; set; }

    public string? Behavior { get; set; }

    public string? Notes { get; set; }
}
