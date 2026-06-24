using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using NECMS.API.Data;
using NECMS.API.Models;
using NECMS.API.Services;

var builder = WebApplication.CreateBuilder(args);

var usePostgres = false;
var pgConn = builder.Configuration.GetConnectionString("DefaultConnection");
try
{
    using var testConn = new NpgsqlConnection(pgConn);
    testConn.Open();
    testConn.Close();
    usePostgres = true;
    Console.WriteLine("✓ PostgreSQL متاح");
}
catch
{
    Console.WriteLine("⚠ PostgreSQL غير متاح - سيتم استخدام SQLite محلياً");
}

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (usePostgres)
        options.UseNpgsql(pgConn);
    else
        options.UseSqlite("Data Source=NECMS.db");
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "NECMS",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "NECMS",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "NECMS_SuperSecretKey_2026_MustBeLongEnough!@#$%^&*()"))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AuditService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();

        if (!context.Users.Any())
        {
            var adminUser = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FullName = "مدير النظام",
                RoleId = 1,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            context.SaveChanges();
        }

        Console.WriteLine("✓ تم الاتصال بقاعدة البيانات بنجاح");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"⚠ تعذر الاتصال بقاعدة البيانات: {ex.Message}");
    Console.WriteLine("⚠ سيتم تشغيل السيرفر ولكن قاعدة البيانات غير متاحة");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
