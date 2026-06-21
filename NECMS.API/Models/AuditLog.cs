using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class AuditLog
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required, MaxLength(50)]
    public string ActionType { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? TableName { get; set; }

    public int? RecordId { get; set; }

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public DateTime ActionDate { get; set; } = DateTime.UtcNow;
}
