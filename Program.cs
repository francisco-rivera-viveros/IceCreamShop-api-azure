using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using System.Linq; // Necesario para Enumerable.Range
using System.Threading.Tasks; // Necesario para async/await

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// ▼▼▼ CONFIGURACIÓN DE BASE DE DATOS: AHORA SIEMPRE USA SQLITE ▼▼▼
// Usa la cadena de conexión "DefaultConnection" definida en appsettings.json
// para crear el archivo helados.db
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);
// ▲▲▲ ▲▲▲ ▲▲▲

var app = builder.Build();

// --- APLICAR MIGRACIONES AUTOMÁTICAMENTE AL INICIAR ---
// Esto creará el archivo helados.db y la tabla Flavors cuando la app inicie
using (var scope = app.Services.CreateScope())
{
    // Usamos Task.Run().Wait() para forzar que esto sea síncrono 
    // y evitar que la app intente iniciar antes de crear la BD.
    Task.Run(() => 
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        dbContext.Database.Migrate();
    }).Wait(); 
}
// --- FIN DE MIGRACIONES ---

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection(); // Comentado para evitar errores de certificado local

// --- Archivos Estáticos (HTML/JS) ---
app.UseDefaultFiles(); 
app.UseStaticFiles();  
// ------------------------------------

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

// ... (API Mínima WeatherForecast) ...
app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}