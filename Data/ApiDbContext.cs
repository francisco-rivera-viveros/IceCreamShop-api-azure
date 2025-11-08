// Data/ApiDbContext.cs

// 1. DECLARAMOS EL NAMESPACE
namespace WebApplication1.Data 
{
    using Microsoft.EntityFrameworkCore;
    using WebApplication1.Models; // Usamos la "dirección completa"

    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) 
            : base(options)
        {
        }
    
        public DbSet<Flavor> Flavors { get; set; }
    }
}