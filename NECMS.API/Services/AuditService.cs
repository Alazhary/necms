using NECMS.API.Data;
using NECMS.API.Models;

namespace NECMS.API.Services;

public class AuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int userId, string actionType, string? tableName, int? recordId, string? oldValue, string? newValue)
    {
        var log = new AuditLog
        {
            UserId = userId,
            ActionType = actionType,
            TableName = tableName,
            RecordId = recordId,
            OldValue = oldValue,
            NewValue = newValue,
            ActionDate = DateTime.UtcNow
        };
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
