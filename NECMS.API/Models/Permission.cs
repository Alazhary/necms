using System.ComponentModel.DataAnnotations;

namespace NECMS.API.Models;

public class Permission
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string PermissionName { get; set; } = string.Empty;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
