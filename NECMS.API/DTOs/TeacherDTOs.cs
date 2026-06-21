namespace NECMS.API.DTOs;

public class CreateTeacherDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public string? Address { get; set; }
    public string? SalaryType { get; set; }
    public decimal SalaryAmount { get; set; }
    public string? Notes { get; set; }
    public List<int> SubjectIds { get; set; } = new();
}

public class TeacherDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public string? Address { get; set; }
    public string? SalaryType { get; set; }
    public decimal SalaryAmount { get; set; }
    public string? Notes { get; set; }
    public List<string> Subjects { get; set; } = new();
}
