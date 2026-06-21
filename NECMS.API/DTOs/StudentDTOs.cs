namespace NECMS.API.DTOs;

public class CreateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? SchoolName { get; set; }
    public int? GradeId { get; set; }
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }

    public string? ParentFullName { get; set; }
    public string? ParentMobile { get; set; }
    public string? ParentMobile2 { get; set; }
    public string? ParentWhatsApp { get; set; }
    public string? ParentAddress { get; set; }
}

public class UpdateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? SchoolName { get; set; }
    public int? GradeId { get; set; }
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public string Status { get; set; } = "Active";
}

public class StudentDto
{
    public int Id { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? SchoolName { get; set; }
    public int? GradeId { get; set; }
    public string? GradeName { get; set; }
    public int? ParentId { get; set; }
    public string? ParentName { get; set; }
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public DateTime RegistrationDate { get; set; }
    public string Status { get; set; } = "Active";
}

public class PromoteStudentDto
{
    public int StudentId { get; set; }
    public int NewGradeId { get; set; }
}
