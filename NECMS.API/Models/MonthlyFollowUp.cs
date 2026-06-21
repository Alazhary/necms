using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class MonthlyFollowUp
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    [MaxLength(20)]
    public string Month { get; set; } = string.Empty;

    public string? AcademicEvaluation { get; set; }

    public string? EthicalEvaluation { get; set; }

    public string? SocialEvaluation { get; set; }

    public string? Notes { get; set; }
}
