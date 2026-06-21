using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Owner")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var today = DateTime.UtcNow.Date;
        var totalStudents = await _context.Students.CountAsync(s => s.Status == "Active");
        var totalTeachers = await _context.Teachers.CountAsync();
        var totalSupervisors = await _context.Supervisors.CountAsync();

        var todayRevenue = await _context.Revenues
            .Where(r => r.Date.Date == today)
            .SumAsync(r => r.Amount);

        var todayExpenses = await _context.Expenses
            .Where(e => e.Date.Date == today)
            .SumAsync(e => e.Amount);

        var totalAttendanceToday = await _context.Attendances
            .CountAsync(a => a.Date.Date == today);

        var presentToday = await _context.Attendances
            .CountAsync(a => a.Date.Date == today && a.Status == "Present");

        var attendancePercentage = totalAttendanceToday > 0
            ? Math.Round((double)presentToday / totalAttendanceToday * 100, 2)
            : 0;

        return Ok(new
        {
            totalStudents,
            totalTeachers,
            totalSupervisors,
            todayRevenue,
            todayExpenses,
            netProfit = todayRevenue - todayExpenses,
            attendancePercentage
        });
    }

    [HttpGet("owner-summary")]
    public async Task<IActionResult> GetOwnerSummary()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalRevenue = await _context.Revenues.SumAsync(r => r.Amount);
        var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);
        var monthRevenue = await _context.Revenues
            .Where(r => r.Date >= monthStart)
            .SumAsync(r => r.Amount);
        var monthExpenses = await _context.Expenses
            .Where(e => e.Date >= monthStart)
            .SumAsync(e => e.Amount);

        var totalStudents = await _context.Students.CountAsync(s => s.Status == "Active");
        var totalTeachers = await _context.Teachers.CountAsync();
        var totalSupervisors = await _context.Supervisors.CountAsync();
        var totalParents = await _context.Parents.CountAsync();

        var totalPayroll = await _context.TeacherPayrolls.SumAsync(p => p.NetSalary)
                         + await _context.SupervisorPayrolls.SumAsync(p => p.NetSalary);

        return Ok(new
        {
            totalStudents,
            totalTeachers,
            totalSupervisors,
            totalParents,
            totalRevenue,
            totalExpenses,
            netProfit = totalRevenue - totalExpenses,
            monthRevenue,
            monthExpenses,
            monthNetProfit = monthRevenue - monthExpenses,
            totalPayroll
        });
    }
}
