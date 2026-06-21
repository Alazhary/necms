using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NECMS.API.Data;
using NECMS.API.DTOs;
using NECMS.API.Models;
using NECMS.API.Services;

namespace NECMS.API.Controllers;

[ApiController]
[Route("api/finance")]
public class FinanceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _auditService;

    public FinanceController(AppDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet("revenues")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetRevenues()
    {
        var revenues = await _context.Revenues
            .Include(r => r.Student)
            .OrderByDescending(r => r.Date)
            .Select(r => new RevenueDto
            {
                Id = r.Id,
                RevenueType = r.RevenueType,
                Amount = r.Amount,
                StudentName = r.Student != null ? r.Student.FullName : null,
                Notes = r.Notes,
                Date = r.Date
            })
            .ToListAsync();
        return Ok(revenues);
    }

    [HttpPost("revenues")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> CreateRevenue([FromBody] CreateRevenueDto dto)
    {
        var revenue = new Revenue
        {
            RevenueType = dto.RevenueType,
            Amount = dto.Amount,
            StudentId = dto.StudentId,
            Notes = dto.Notes,
            Date = dto.Date
        };
        _context.Revenues.Add(revenue);
        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Create", "Revenue", revenue.Id, null, $"{dto.RevenueType}:{dto.Amount}");

        return Ok(revenue);
    }

    [HttpGet("expenses")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetExpenses()
    {
        var expenses = await _context.Expenses
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                ExpenseType = e.ExpenseType,
                Amount = e.Amount,
                Notes = e.Notes,
                Date = e.Date
            })
            .ToListAsync();
        return Ok(expenses);
    }

    [HttpPost("expenses")]
    [Authorize(Roles = "Owner,Supervisor")]
    public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        var expense = new Expense
        {
            ExpenseType = dto.ExpenseType,
            Amount = dto.Amount,
            Notes = dto.Notes,
            Date = dto.Date
        };
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Create", "Expense", expense.Id, null, $"{dto.ExpenseType}:{dto.Amount}");

        return Ok(expense);
    }

    [HttpGet("report")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetReport([FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        var from = dateFrom ?? DateTime.UtcNow.AddMonths(-1);
        var to = dateTo ?? DateTime.UtcNow;

        var revenues = await _context.Revenues
            .Include(r => r.Student)
            .Where(r => r.Date >= from && r.Date <= to)
            .OrderByDescending(r => r.Date)
            .Select(r => new RevenueDto
            {
                Id = r.Id,
                RevenueType = r.RevenueType,
                Amount = r.Amount,
                StudentName = r.Student != null ? r.Student.FullName : null,
                Notes = r.Notes,
                Date = r.Date
            })
            .ToListAsync();

        var expenses = await _context.Expenses
            .Where(e => e.Date >= from && e.Date <= to)
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                ExpenseType = e.ExpenseType,
                Amount = e.Amount,
                Notes = e.Notes,
                Date = e.Date
            })
            .ToListAsync();

        var report = new FinancialReportDto
        {
            TotalRevenue = revenues.Sum(r => r.Amount),
            TotalExpenses = expenses.Sum(e => e.Amount),
            NetProfit = revenues.Sum(r => r.Amount) - expenses.Sum(e => e.Amount),
            Revenues = revenues,
            Expenses = expenses
        };

        return Ok(report);
    }

    [HttpPost("payroll/teacher")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> CreateTeacherPayroll([FromBody] CreatePayrollDto dto)
    {
        var teacher = await _context.Teachers.FindAsync(dto.TeacherId);
        if (teacher == null)
            return NotFound(new { message = "Teacher not found" });

        var netSalary = dto.Salary + dto.Bonus - dto.Deduction;

        var payroll = new TeacherPayroll
        {
            TeacherId = dto.TeacherId,
            Month = dto.Month,
            Salary = dto.Salary,
            Bonus = dto.Bonus,
            Deduction = dto.Deduction,
            NetSalary = netSalary
        };
        _context.TeacherPayrolls.Add(payroll);
        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _auditService.LogAsync(userId, "Create", "TeacherPayroll", payroll.Id, null, $"{dto.Month}:{netSalary}");

        return Ok(payroll);
    }

    [HttpGet("payroll/teacher")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetTeacherPayrolls()
    {
        var payrolls = await _context.TeacherPayrolls
            .Include(p => p.Teacher)
            .OrderByDescending(p => p.Month)
            .ToListAsync();
        return Ok(payrolls);
    }

    [HttpGet("student-account/{studentId}")]
    [Authorize]
    public async Task<IActionResult> GetStudentAccount(int studentId)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var userParentId = User.FindFirstValue("ParentId");

        if (userRole == "Parent")
        {
            var hasAccess = await _context.Students
                .AnyAsync(s => s.Id == studentId && s.ParentId.ToString() == userParentId);
            if (!hasAccess)
                return Forbid();
        }
        else if (userRole != "Owner")
        {
            return Forbid();
        }

        var revenues = await _context.Revenues
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.Date)
            .Select(r => new RevenueDto
            {
                Id = r.Id,
                RevenueType = r.RevenueType,
                Amount = r.Amount,
                Notes = r.Notes,
                Date = r.Date
            })
            .ToListAsync();

        return Ok(new
        {
            StudentId = studentId,
            TotalPaid = revenues.Sum(r => r.Amount),
            Transactions = revenues
        });
    }
}
