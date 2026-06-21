using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Notification
{
    public int Id { get; set; }

    public int? StudentId { get; set; }
    public Student? Student { get; set; }

    public int? ParentId { get; set; }
    public Parent? Parent { get; set; }

    [MaxLength(50)]
    public string NotificationType { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public DateTime SentDate { get; set; } = DateTime.UtcNow;
}
