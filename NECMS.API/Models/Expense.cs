using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Expense
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string ExpenseType { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string? Notes { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;
}
