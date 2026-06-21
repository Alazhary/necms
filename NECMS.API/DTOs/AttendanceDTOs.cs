namespace NECMS.API.DTOs;

public class CreateAttendanceDto
{
    public int StudentId { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class BulkAttendanceDto
{
    public DateTime Date { get; set; }
    public List<StudentAttendanceDto> Attendances { get; set; } = new();
}

public class StudentAttendanceDto
{
    public int StudentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
