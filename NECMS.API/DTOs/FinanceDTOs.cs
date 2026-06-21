namespace NECMS.API.DTOs;

public class CreateRevenueDto
{
    public string RevenueType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int? StudentId { get; set; }
    public string? Notes { get; set; }
    public DateTime Date { get; set; }
}

public class CreateExpenseDto
{
    public string ExpenseType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public DateTime Date { get; set; }
}

public class CreatePayrollDto
{
    public int TeacherId { get; set; }
    public string Month { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deduction { get; set; }
}

public class FinancialReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public List<RevenueDto> Revenues { get; set; } = new();
    public List<ExpenseDto> Expenses { get; set; } = new();
}

public class RevenueDto
{
    public int Id { get; set; }
    public string RevenueType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? StudentName { get; set; }
    public string? Notes { get; set; }
    public DateTime Date { get; set; }
}

public class ExpenseDto
{
    public int Id { get; set; }
    public string ExpenseType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public DateTime Date { get; set; }
}
