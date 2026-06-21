using Microsoft.EntityFrameworkCore;
using NECMS.API.Models;

namespace NECMS.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<TeacherSubject> TeacherSubjects => Set<TeacherSubject>();
    public DbSet<Supervisor> Supervisors => Set<Supervisor>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamResult> ExamResults => Set<ExamResult>();
    public DbSet<DailyFollowUp> DailyFollowUps => Set<DailyFollowUp>();
    public DbSet<WeeklyFollowUp> WeeklyFollowUps => Set<WeeklyFollowUp>();
    public DbSet<MonthlyFollowUp> MonthlyFollowUps => Set<MonthlyFollowUp>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Revenue> Revenues => Set<Revenue>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<TeacherPayroll> TeacherPayrolls => Set<TeacherPayroll>();
    public DbSet<SupervisorPayroll> SupervisorPayrolls => Set<SupervisorPayroll>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId);

        modelBuilder.Entity<TeacherSubject>()
            .HasKey(ts => new { ts.TeacherId, ts.SubjectId });

        modelBuilder.Entity<TeacherSubject>()
            .HasOne(ts => ts.Teacher)
            .WithMany(t => t.TeacherSubjects)
            .HasForeignKey(ts => ts.TeacherId);

        modelBuilder.Entity<TeacherSubject>()
            .HasOne(ts => ts.Subject)
            .WithMany(s => s.TeacherSubjects)
            .HasForeignKey(ts => ts.SubjectId);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Student)
            .WithOne(s => s.User)
            .HasForeignKey<User>(u => u.StudentId);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Parent)
            .WithMany(p => p.Users)
            .HasForeignKey(u => u.ParentId);

        modelBuilder.Entity<Teacher>()
            .HasOne(t => t.User)
            .WithOne()
            .HasForeignKey<Teacher>(t => t.UserId);

        modelBuilder.Entity<Supervisor>()
            .HasOne(s => s.User)
            .WithOne()
            .HasForeignKey<Supervisor>(s => s.UserId);

        modelBuilder.Entity<Student>()
            .HasIndex(s => s.StudentCode)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Grade>().HasData(
            new Grade { Id = 1, GradeName = "الحضانة" },
            new Grade { Id = 2, GradeName = "الأول الابتدائي" },
            new Grade { Id = 3, GradeName = "الثاني الابتدائي" },
            new Grade { Id = 4, GradeName = "الثالث الابتدائي" },
            new Grade { Id = 5, GradeName = "الرابع الابتدائي" },
            new Grade { Id = 6, GradeName = "الخامس الابتدائي" },
            new Grade { Id = 7, GradeName = "السادس الابتدائي" },
            new Grade { Id = 8, GradeName = "الأول الإعدادي" },
            new Grade { Id = 9, GradeName = "الثاني الإعدادي" },
            new Grade { Id = 10, GradeName = "الثالث الإعدادي" }
        );

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, RoleName = "Owner" },
            new Role { Id = 2, RoleName = "Supervisor" },
            new Role { Id = 3, RoleName = "Teacher" },
            new Role { Id = 4, RoleName = "Parent" },
            new Role { Id = 5, RoleName = "Student" }
        );

        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, PermissionName = "ManageUsers" },
            new Permission { Id = 2, PermissionName = "ManageStudents" },
            new Permission { Id = 3, PermissionName = "ManageTeachers" },
            new Permission { Id = 4, PermissionName = "ManageSupervisors" },
            new Permission { Id = 5, PermissionName = "ManageAttendance" },
            new Permission { Id = 6, PermissionName = "ManageExams" },
            new Permission { Id = 7, PermissionName = "ManageGrades" },
            new Permission { Id = 8, PermissionName = "ManageFinance" },
            new Permission { Id = 9, PermissionName = "ViewReports" },
            new Permission { Id = 10, PermissionName = "ManageFollowUps" },
            new Permission { Id = 11, PermissionName = "ViewOwnData" },
            new Permission { Id = 12, PermissionName = "EnterExamResults" }
        );
    }
}
