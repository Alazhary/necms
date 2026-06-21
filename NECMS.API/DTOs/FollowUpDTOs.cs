namespace NECMS.API.DTOs;

public class CreateDailyFollowUpDto
{
    public int StudentId { get; set; }
    public DateTime FollowUpDate { get; set; }
    public string? Homework { get; set; }
    public string? Participation { get; set; }
    public string? Behavior { get; set; }
    public string? Notes { get; set; }
}

public class CreateWeeklyFollowUpDto
{
    public int StudentId { get; set; }
    public int WeekNumber { get; set; }
    public string? AcademicLevel { get; set; }
    public string? BehaviorLevel { get; set; }
    public string? Notes { get; set; }
}

public class CreateMonthlyFollowUpDto
{
    public int StudentId { get; set; }
    public string Month { get; set; } = string.Empty;
    public string? AcademicEvaluation { get; set; }
    public string? EthicalEvaluation { get; set; }
    public string? SocialEvaluation { get; set; }
    public string? Notes { get; set; }
}
